// Camera Roll catalog: joins src/data/camera-roll.json (what each frame is and
// where it sits) to the scans in src/assets/images/camera-roll/ (lab filename =
// 9-digit roll id + 3-digit frame number). The build fails if the two disagree,
// so a frame can't be on disk but missing from the page, or the other way round.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import data from '../data/camera-roll.json';

export interface Frame {
  /** Anchor id, also the shareable link: /camera-roll/#r8-003 */
  id: string;
  roll: number;
  frame: string;
  desc: string;
  alt: string;
  /** Section id plus the frame's tags, for the filter chips. */
  tags: string[];
  image: ImageMetadata;
  ratio: number;
  thumb: { src: string; srcset: string };
  large: { src: string; srcset: string };
}
export interface Chapter {
  title: string;
  frames: Frame[];
}
export interface RollPart {
  no: number;
  /** Anchor id of this half of the roll: golf-roll-8 */
  anchor: string;
  title: string;
  date: string | null;
  place: string | null;
  cover: Frame;
  chapters: Chapter[];
  frames: Frame[];
  /** The other half of the same roll, when it has frames in both sections. */
  twin?: { anchor: string; count: number; section: string; below: boolean };
}
export interface Section {
  id: string;
  title: string;
  tags: { id: string; title: string; count: number }[];
  rolls: RollPart[];
  count: number;
}

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/camera-roll/*.jpg',
  { eager: true }
);
const scans = new Map(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace('.jpg', ''), mod.default])
);

const fail = (message: string): never => {
  throw new Error(`[camera-roll] ${message}`);
};

export async function loadCameraRoll() {
  const used = new Set<string>();

  const sections: Section[] = await Promise.all(
    data.sections.map(async (section) => {
      const rolls: RollPart[] = await Promise.all(
        section.rolls.map(async (roll) => {
          const chapters: Chapter[] = await Promise.all(
            roll.chapters.map(async (chapter) => ({
              title: chapter.title,
              frames: await Promise.all(
                chapter.frames.map(async (f): Promise<Frame> => {
                  const name = `${roll.id}${f.frame}`;
                  const image = scans.get(name) ?? fail(`${name}.jpg is in camera-roll.json but not in src/assets/images/camera-roll/`);
                  if (used.has(name)) fail(`${name} is listed twice in camera-roll.json`);
                  used.add(name);
                  // 400/800/1200 are the widths the page has always cut, so the image cache still hits
                  const thumb = await getImage({ src: image, width: 400, widths: [400, 800], format: 'webp' });
                  const large = await getImage({ src: image, width: 1200, widths: [1200, 2000], format: 'webp' });
                  return {
                    id: `r${roll.no}-${f.frame}`,
                    roll: roll.no,
                    frame: f.frame,
                    desc: f.alt,
                    alt: `Roll ${roll.no}, frame ${f.frame}: ${f.alt}`,
                    tags: [section.id, ...f.tags],
                    image,
                    ratio: image.width / image.height,
                    thumb: { src: thumb.src, srcset: thumb.srcSet.attribute },
                    large: { src: large.src, srcset: large.srcSet.attribute },
                  };
                })
              ),
            }))
          );
          const frames = chapters.flatMap((c) => c.frames);
          const cover = frames.find((f) => f.frame === roll.cover) ?? fail(`roll ${roll.no} (${section.id}): cover frame ${roll.cover} is not in that half`);
          return {
            no: roll.no,
            anchor: `${section.id}-roll-${roll.no}`,
            title: roll.title,
            date: roll.date,
            place: roll.place,
            cover,
            chapters,
            frames,
          };
        })
      );
      const all = rolls.flatMap((r) => r.frames);
      return {
        id: section.id,
        title: section.title,
        tags: section.tags.map((t) => ({ ...t, count: all.filter((f) => f.tags.includes(t.id)).length })),
        rolls,
        count: all.length,
      };
    })
  );

  const orphans = [...scans.keys()].filter((name) => !used.has(name));
  if (orphans.length) {
    fail(`${orphans.length} scan(s) on disk are not in camera-roll.json: ${orphans.slice(0, 8).join(', ')}. Add them to the catalog or remove the files.`);
  }

  // A roll with both kinds of picture appears once per section; link the halves.
  sections.forEach((section, i) => {
    for (const roll of section.rolls) {
      sections.forEach((other, j) => {
        const twin = i !== j && other.rolls.find((r) => r.no === roll.no);
        if (twin) roll.twin = { anchor: twin.anchor, count: twin.frames.length, section: other.title, below: j > i };
      });
    }
  });

  return {
    sections,
    frameCount: used.size,
    rollCount: new Set(sections.flatMap((s) => s.rolls.map((r) => r.no))).size,
  };
}
