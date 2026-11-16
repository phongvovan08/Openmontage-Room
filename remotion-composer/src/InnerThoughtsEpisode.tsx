import React, {useEffect, useMemo, useState} from 'react';
import {
  AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Easing, Img,
  interpolate, Loop, Sequence, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {Video as FrameAccurateVideo} from '@remotion/media';
import type {WordCaption} from './components/CaptionOverlay';
import {resolveAsset} from './lib/resolveAsset';

export interface InnerThoughtsChapter {
  id: number;
  name: string;
  start: number;
  end: number;
}

export interface InnerThoughtsBeat {
  id: string;
  start: number;
  end: number;
  kind: 'footage' | 'image' | 'phone' | 'note' | 'comparison' | 'question' | 'chapter' | 'source';
  chapterId: number;
  title?: string;
  text?: string;
  lines?: string[];
  noteLabels?: string[];
  leftLabel?: string;
  rightLabel?: string;
  left?: string;
  right?: string;
  media?: string;
  mediaStart?: number;
  /** Actual usable clip length, seconds. Short footage can then loop safely. */
  mediaDuration?: number;
  sourceCredit?: string;
}

export interface InnerThoughtsProps {
  durationSeconds: number;
  narration: string;
  music: string;
  fontRegular: string;
  fontSemibold: string;
  chapters: InnerThoughtsChapter[];
  beats: InnerThoughtsBeat[];
  captions: WordCaption[];
  sfx?: Array<{src: string; start: number; volume?: number}>;
}

const THEME = {
  midnight: '#0b132b', jade: '#34d399', cream: '#f5efe4', paper: '#eee7d8',
  ink: '#28313b', gray: '#a7adb7', slate: '#1c283c', black: '#050b13', white: '#ffffff',
  book: 'InnerThoughtsBook, sans-serif', semi: 'InnerThoughtsSemi, sans-serif',
  out: Easing.bezier(0.18, 0.7, 0.24, 1),
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  enter: {damping: 24, stiffness: 95, mass: 1.05},
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = {...clamp, easing: THEME.out};

// Rasterized procedural grain avoids repeated SVG pattern rasterization.
const GRAIN = "url(data:image/png;base64,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)";

/** Last item starting at or before time, O(log n); timing arrays must be sorted. */
function indexAt<T>(items: T[], time: number, start: (item: T) => number): number {
  let low = 0;
  let high = items.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (start(items[mid]) <= time) {found = mid; low = mid + 1;}
    else high = mid - 1;
  }
  return found;
}

const Background: React.FC = () => (
  <AbsoluteFill style={{background: THEME.midnight}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 18% 20%, ${THEME.slate} 0%, transparent 60%), radial-gradient(ellipse at 90% 85%, ${THEME.ink}66 0%, transparent 56%)`}} />
  </AbsoluteFill>
);

const Finish: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${THEME.midnight}50 0%, transparent 30%, transparent 65%, ${THEME.black}b8 100%)`}} />
    <AbsoluteFill style={{background: THEME.midnight, opacity: 0.08, mixBlendMode: 'color'}} />
    <AbsoluteFill style={{backgroundImage: GRAIN, backgroundSize: '180px 180px', opacity: 0.075}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 44%, ${THEME.black}82 100%)`}} />
  </AbsoluteFill>
);

const Enter: React.FC<{children: React.ReactNode; delay?: number; style?: React.CSSProperties}> = ({children, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - Math.round(delay * fps), fps, config: THEME.enter});
  return <div style={{...style, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [26, 0], ease)}px) scale(${interpolate(p, [0, 1], [0.985, 1], ease)})`}}>{children}</div>;
};

const Media: React.FC<{beat: InnerThoughtsBeat; duration: number}> = ({beat, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!beat.media) return null;
  const still = beat.kind === 'image' || /\.(png|jpe?g|webp|avif)(?:[?#].*)?$/i.test(beat.media);
  const p = interpolate(frame, [0, Math.max(1, duration - 1)], [0, 1], {...clamp, easing: THEME.inOut});
  const reverse = beat.id.charCodeAt(beat.id.length - 1) % 2 === 0;
  const scale = reverse ? 1.075 - p * 0.055 : 1.015 + p * 0.055;
  const source = resolveAsset(beat.media);
  const start = Math.round((beat.mediaStart ?? 0) * fps);
  // Mediabunny/WebCodecs extracts exact frames; unsupported codecs fall back to OffthreadVideo.
  const video = <FrameAccurateVideo src={source} muted trimBefore={start} objectFit="cover" style={{width: '100%', height: '100%'}} />;
  const usable = beat.mediaDuration ? Math.max(1, Math.floor(beat.mediaDuration * fps) - start - 1) : 0;
  return <AbsoluteFill style={{overflow: 'hidden', opacity: ['footage', 'image'].includes(beat.kind) ? 1 : 0.48}}>
    {still ? <Img src={source} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${(reverse ? -1 : 1) * p * 16}px)`}} />
      : usable > 0 && duration > usable ? <Loop durationInFrames={usable}>{video}</Loop> : video}
    <AbsoluteFill style={{background: `linear-gradient(90deg, ${THEME.midnight}20, transparent 45%, ${THEME.midnight}10)`, pointerEvents: 'none'}} />
  </AbsoluteFill>;
};

const SmallLabel: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontFamily: THEME.semi, fontSize: 21, letterSpacing: 3.1, textTransform: 'uppercase', color: THEME.gray, marginBottom: 22}}>{children}</div>;

const Phone: React.FC<{beat: InnerThoughtsBeat}> = ({beat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = beat.text ?? 'Về chuyện lúc họp, em muốn nói là…';
  const count = Math.floor(interpolate(frame, [fps * 0.65, fps * Math.min(5, Math.max(2, text.length / 13))], [0, text.length], ease));
  const draft = text.slice(0, count);
  const time = /02[:.]11|lẻ mười một/i.test(beat.title ?? '') ? '02:11' : '02:07';
  return <AbsoluteFill style={{padding: '160px 165px 200px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 100}}>
    <Enter style={{width: 730}}>
      <SmallLabel>{beat.title ? 'Tin nhắn chưa gửi' : 'Hai giờ lẻ bảy'}</SmallLabel>
      <div style={{fontFamily: THEME.semi, fontSize: 70, lineHeight: 1.23, letterSpacing: -2.3, color: THEME.cream}}>{beat.title ?? 'Cuộc trò chuyện đã xong.\nCâu nói vẫn còn.'}</div>
      <div style={{width: 66, height: 3, background: THEME.cream, opacity: 0.5, marginTop: 40}} />
    </Enter>
    <Enter delay={0.14} style={{width: 530, flexShrink: 0}}>
      <div style={{height: 660, borderRadius: 48, border: `2px solid ${THEME.gray}55`, background: THEME.black, boxShadow: `0 35px 90px ${THEME.black}b0`, padding: '26px 28px', transform: `rotate(-2deg) translateY(${Math.sin(frame / (fps * 2)) * 2}px)`, display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, color: THEME.cream, fontFamily: THEME.semi}}><span>{time}</span><span style={{letterSpacing: 3}}>•••</span></div>
        <div style={{padding: '29px 0 23px', borderBottom: `1px solid ${THEME.gray}33`, fontSize: 27, fontFamily: THEME.semi, textAlign: 'center'}}>Cuộc trò chuyện</div>
        <div style={{alignSelf: 'flex-start', background: THEME.slate, padding: '21px 23px', borderRadius: '20px 20px 20px 5px', fontSize: 30, lineHeight: 1.45, marginTop: 35, maxWidth: 390}}>{beat.left ?? 'Em nghĩ đơn giản quá.'}</div>
        <div style={{marginTop: 'auto', fontFamily: THEME.book, fontSize: 19, color: THEME.gray, marginBottom: 13}}>BẢN NHÁP</div>
        <div style={{border: `1px solid ${THEME.gray}70`, minHeight: 143, borderRadius: 22, padding: '19px 21px', fontSize: 29, lineHeight: 1.4, color: THEME.cream}}>{draft}<span style={{opacity: Math.sin(frame / (fps * 0.23)) > 0 ? 0.8 : 0}}>│</span></div>
        <div style={{fontSize: 17, color: THEME.gray, textAlign: 'right', marginTop: 16}}>Chưa gửi</div>
      </div>
    </Enter>
  </AbsoluteFill>;
};

const Note: React.FC<{beat: InnerThoughtsBeat}> = ({beat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = beat.lines ?? [beat.text ?? ''];
  const labels = beat.noteLabels ?? ['Điều đã xảy ra', 'Điều mình đang sợ', 'Điều còn chưa biết'];
  return <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 100}}>
    <Enter style={{width: 1320}}>
      <div style={{background: THEME.paper, color: THEME.ink, padding: '48px 64px 50px', borderRadius: 7, transform: `rotate(-0.65deg) translateY(${Math.sin(frame / (fps * 3)) * 1.4}px)`, boxShadow: `0 30px 90px ${THEME.black}80`}}>
        <div style={{fontSize: 24, fontFamily: THEME.semi, color: `${THEME.ink}a0`, marginBottom: 30, letterSpacing: 2}}>{beat.title ?? 'GHI CHÚ · TỐI NAY'}</div>
        {lines.slice(0, 4).map((line, i) => <Enter key={i} delay={0.12 + i * 0.16} style={{padding: '19px 0 22px', borderTop: `1px solid ${THEME.ink}25`}}>
          {lines.length === 3 && <div style={{fontSize: 19, marginBottom: 8, color: `${THEME.ink}a0`, fontFamily: THEME.semi}}>{labels[i]}</div>}
          <div style={{fontSize: line.length > 100 ? 35 : 41, lineHeight: 1.4, fontFamily: THEME.book}}>{line}</div>
        </Enter>)}
      </div>
    </Enter>
  </AbsoluteFill>;
};

const Comparison: React.FC<{beat: InnerThoughtsBeat}> = ({beat}) => (
  <AbsoluteFill style={{padding: '220px 170px 230px', justifyContent: 'center'}}>
    <Enter><SmallLabel>{beat.title ?? 'Một khoảng cách nhỏ'}</SmallLabel></Enter>
    <div style={{display: 'flex', gap: 80, marginTop: 24}}>
      {[{label: beat.leftLabel ?? 'Lời đã được nói', text: beat.left ?? '“Em nghĩ đơn giản quá.”'}, {label: beat.rightLabel ?? 'Điều mình nghe ra', text: beat.right ?? '“Mình không đủ năng lực.”'}].map((column, i) => <Enter key={column.label} delay={i * 0.16} style={{width: '50%', padding: '34px 0 0', borderTop: `1px solid ${THEME.cream}70`}}>
        <div style={{fontSize: 24, color: THEME.gray, marginBottom: 29}}>{column.label}</div>
        <div style={{fontSize: column.text.length > 90 ? 46 : 57, lineHeight: 1.32, fontFamily: THEME.semi, letterSpacing: -1.1}}>{column.text}</div>
      </Enter>)}
    </div>
  </AbsoluteFill>
);

const Editorial: React.FC<{beat: InnerThoughtsBeat}> = ({beat}) => {
  const text = beat.text || beat.title || '';
  return <AbsoluteFill style={{padding: '205px 190px 230px', justifyContent: 'center'}}>
    <Enter><SmallLabel>{beat.kind === 'chapter' ? `PHẦN ${String(beat.chapterId).padStart(2, '0')}` : beat.kind === 'source' ? 'Một góc nhìn từ nghiên cứu' : beat.title ?? 'Một câu hỏi cho ngày mai'}</SmallLabel></Enter>
    <Enter delay={0.14} style={{maxWidth: 1420}}><div style={{fontFamily: THEME.semi, fontSize: text.length > 150 ? 56 : text.length > 85 ? 66 : 86, letterSpacing: -1.8, lineHeight: 1.28, whiteSpace: 'pre-line'}}>{text}</div></Enter>
    {beat.lines?.map((line, i) => <Enter key={i} delay={0.3 + i * 0.16} style={{fontSize: 31, color: THEME.gray, maxWidth: 1280, marginTop: 23, lineHeight: 1.45}}>{line}</Enter>)}
  </AbsoluteFill>;
};

const Scene: React.FC<{beat: InnerThoughtsBeat; duration: number}> = ({beat, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, Math.max(1, fps * 0.32)], [0, 1], ease);
  const fadeOut = interpolate(frame, [Math.max(0, duration - fps * 0.22), duration], [1, 0], ease);
  return <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut), transform: `scale(${interpolate(frame, [0, fps * 0.4], [1.008, 1], ease)})`}}>
    <Media beat={beat} duration={duration} />
    {beat.kind === 'phone' ? <Phone beat={beat} /> : beat.kind === 'note' ? <Note beat={beat} /> : beat.kind === 'comparison' ? <Comparison beat={beat} /> : ['question', 'chapter', 'source'].includes(beat.kind) ? <Editorial beat={beat} /> : beat.title ? <AbsoluteFill style={{padding: '0 150px 260px', justifyContent: 'flex-end'}}><Enter delay={0.15} style={{fontFamily: THEME.semi, fontSize: 58, lineHeight: 1.2, maxWidth: 1220, textShadow: `0 3px 24px ${THEME.black}`}}>{beat.title}</Enter></AbsoluteFill> : null}
  </AbsoluteFill>;
};

interface CaptionPage {words: WordCaption[]; start: number; end: number}
function paginate(words: WordCaption[]): CaptionPage[] {
  const pages: CaptionPage[] = [];
  let group: WordCaption[] = [];
  const flush = () => {
    if (!group.length) return;
    pages.push({words: group, start: group[0].startMs, end: group[group.length - 1].endMs});
    group = [];
  };
  words.forEach((word) => {group.push(word); if (group.length === 6 || word.pageBreakAfter) flush();});
  flush();
  return pages;
}

/** Single mounted caption page, unlike the generic overlay's all-page Sequences. */
const Captions: React.FC<{words: WordCaption[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pages = useMemo(() => paginate(words), [words]);
  const ms = frame / fps * 1000;
  const at = indexAt(pages, ms, (p) => p.start);
  const page = pages[at];
  if (!page || ms > Math.min(pages[at + 1]?.start ?? Infinity, page.end + 650)) return null;
  const local = frame - Math.round(page.start / 1000 * fps);
  const p = spring({frame: local, fps, config: {damping: 25, stiffness: 220}});
  return <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 77, pointerEvents: 'none'}}>
    <div style={{fontFamily: THEME.semi, fontSize: 44, lineHeight: 1.32, maxWidth: 1500, textAlign: 'center', padding: '12px 26px 15px', borderRadius: 8, background: `${THEME.black}b8`, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [8, 0], ease)}px) scale(${interpolate(p, [0, 1], [0.992, 1], ease)})`, textShadow: `0 2px 5px ${THEME.black}`}}>
      {page.words.map((word, i) => <React.Fragment key={i}><span style={{color: ms >= word.startMs && ms < word.endMs ? THEME.jade : THEME.cream, display: 'inline-block', whiteSpace: 'nowrap'}}>{word.word}</span>{i < page.words.length - 1 ? ' ' : ''}</React.Fragment>)}
    </div>
  </AbsoluteFill>;
};

const EpisodeFonts: React.FC<{regular: string; semibold: string}> = ({regular, semibold}) => {
  const [handle] = useState(() => delayRender('Loading episode Vietnamese fonts', {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    Promise.all([['InnerThoughtsBook', regular], ['InnerThoughtsSemi', semibold]].filter(([, path]) => Boolean(path)).map(async ([name, path]) => {
      const font = new FontFace(name, `url("${resolveAsset(path)}")`);
      await font.load();
      (document.fonts as FontFaceSet & {add: (face: FontFace) => FontFaceSet}).add(font);
    })).then(() => continueRender(handle)).catch(cancelRender);
  }, [regular, semibold, handle]);
  return null;
};

export const InnerThoughtsEpisode: React.FC<InnerThoughtsProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const sorted = useMemo(() => [...props.beats].sort((a, b) => a.start - b.start), [props.beats]);
  const chapters = useMemo(() => [...props.chapters].sort((a, b) => a.start - b.start), [props.chapters]);
  const beat = sorted[indexAt(sorted, seconds, (b) => b.start)];
  const activeBeat = beat && seconds < beat.end ? beat : undefined;
  const chapter = chapters[indexAt(chapters, seconds, (c) => c.start)];
  const chapterFrame = chapter ? frame - Math.round(chapter.start * fps) : 0;
  const chapterIn = spring({frame: chapterFrame, fps, config: THEME.enter});
  const progress = Math.max(0, Math.min(1, frame / Math.max(1, Math.ceil(props.durationSeconds * fps) - 1)));
  const musicVolume = (f: number) => Math.min(interpolate(f, [0, 2 * fps], [0, 0.28], ease), interpolate(f, [Math.max(0, (props.durationSeconds - 2) * fps), props.durationSeconds * fps], [0.28, 0], ease));
  return <AbsoluteFill style={{fontFamily: THEME.book, color: THEME.cream, background: THEME.midnight, overflow: 'hidden'}}>
    <EpisodeFonts regular={props.fontRegular} semibold={props.fontSemibold} />
    <Background />
    {activeBeat && <Sequence key={activeBeat.id} from={Math.round(activeBeat.start * fps)} durationInFrames={Math.max(1, Math.round(activeBeat.end * fps) - Math.round(activeBeat.start * fps))}>
      <Scene beat={activeBeat} duration={Math.max(1, Math.round(activeBeat.end * fps) - Math.round(activeBeat.start * fps))} />
    </Sequence>}
    <Finish />
    {chapter && <div style={{position: 'absolute', top: 61, left: 82, maxWidth: 1380, display: 'flex', gap: 19, alignItems: 'center', opacity: chapterIn * 0.9, transform: `translateY(${interpolate(chapterIn, [0, 1], [9, 0], ease)}px)`}}><span style={{fontSize: 18, letterSpacing: 1.4, border: `1px solid ${THEME.cream}50`, borderRadius: 20, padding: '6px 12px', fontFamily: THEME.semi}}>{String(chapter.id).padStart(2, '0')}</span><span style={{fontSize: 22, textShadow: `0 2px 12px ${THEME.black}`}}>{chapter.name}</span></div>}
    <div style={{position: 'absolute', top: 72, right: 82, fontFamily: THEME.semi, fontSize: 18, letterSpacing: 3, opacity: 0.68}}>TÂM LÝ NỘI TÂM</div>
    {activeBeat?.sourceCredit && <div style={{position: 'absolute', left: 86, bottom: 188, maxWidth: 1400, fontSize: 17, color: THEME.cream, opacity: 0.8, textShadow: `0 2px 6px ${THEME.black}`}}>{activeBeat.sourceCredit}</div>}
    <Captions words={props.captions} />
    <div style={{position: 'absolute', bottom: 0, left: 0, width: `${progress * 100}%`, height: 3, background: `${THEME.cream}88`}} />
    {props.narration && <Audio src={resolveAsset(props.narration)} volume={1} />}
    {props.music && <Audio src={resolveAsset(props.music)} volume={musicVolume} loop loopVolumeCurveBehavior="extend" />}
    {(props.sfx ?? []).map((sound, i) => <Sequence key={`${sound.src}-${i}`} from={Math.round(sound.start * fps)}><Audio src={resolveAsset(sound.src)} volume={sound.volume ?? 0.25} /></Sequence>)}
  </AbsoluteFill>;
};
