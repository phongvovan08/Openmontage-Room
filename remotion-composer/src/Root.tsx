import { Composition, CalculateMetadataFunction } from "remotion";
import { Explainer, ExplainerProps } from "./Explainer";
import {
  CinematicRenderer,
  calculateCinematicMetadata,
} from "./CinematicRenderer";
import { signalFromTomorrowWithMusicFixture } from "./cinematic/fixtures";
import {
  TalkingHead,
  TalkingHeadProps,
  calculateTalkingHeadMetadata,
} from "./TalkingHead";
import {
  TitledVideo,
  calculateTitledVideoMetadata,
} from "./TitledVideo";
import { EndTag, EndTagProps } from "./components/EndTag";
import { HeroTitle } from "./components/HeroTitle";
import { ProductReveal, ProductRevealProps } from "./components/ProductReveal";
import { CaptionOverlay, WordCaption } from "./components/CaptionOverlay";
import { CollageBurst, CollageBurstProps } from "./CollageBurst";
import { LyricOverlay, LyricOverlayProps } from "./LyricOverlay";
import { InnerThoughtsEpisode, InnerThoughtsProps } from "./InnerThoughtsEpisode";
import {
  ReactiveMindAtelier,
  ReactiveMindAtelierProps,
} from "./ReactiveMindAtelier";
import {
  Loai07CollageBurst,
  Loai08UIChatSim,
  Loai09PoeticQuote,
  Loai10BookReveal,
  Loai11DanKoeSketch,
  Loai12SplitRoleplay,
  Loai13PodcastAudiogram,
  ShowcaseVideoProps,
} from "./Showcase7To13";
import {
  TiktokVerticalBespoke,
  TiktokVerticalBespokeProps,
} from "./TiktokVerticalBespoke";
import {
  PhatBieuCartoon2D,
  PhatBieuCartoon2DProps,
} from "./PhatBieuCartoon2D";
import { CharacterSelectionBoard } from "./CharacterSelectionBoard";
import { MochiVertical9x16, MochiVertical9x16Props } from "./MochiVertical9x16";
import { CrayonDoodle9x16, CrayonDoodle9x16Props } from "./CrayonDoodle9x16";
import {
  CarterSelfDevStyle9x16,
  MochiCarterVertical9x16,
  CarterSelfDevProps,
} from "./CarterSelfDevSuite";
import {
  StickmanB1Director,
  StickmanB1DirectorProps,
} from "./StickmanB1Director";
import {
  StickmanFullMotion9x16,
  StickmanFullMotion9x16Props,
} from "./StickmanFullMotion9x16";
import {
  TurboFlowOmniFlash9x16,
  TurboFlowOmniFlash9x16Props,
} from "./TurboFlowOmniFlash9x16";
import {
  BeMochiEp01Master,
  BeMochiEp01Props,
} from "./BeMochiEp01Suite";
import {
  BeMochiEp01Full16x9,
  BeMochiEp01FullProps,
} from "./BeMochiEp01Full16x9";
import { BeMochi5StatesShowcase } from "./components/MochiCharacter";
import { MochiLocalDemoRoot } from "./MochiLocalComparison";
import { MochiThreeStylesRoot } from "./MochiThreeStyles";
import { HumanReferenceRoot } from "./HumanReferenceRevision";
import { PaperPuppetRoot } from "./PaperPuppetFilm";
import { OpenPeepsRoot } from "./OpenPeepsDemo";
import { BridgeRoot } from "./videos/bridge/BridgeRoot";

// ---------------------------------------------------------------------------
// Theme System — prevents every video from looking like dark fintech
// ---------------------------------------------------------------------------

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  chartColors: string[];
  springConfig: { damping: number; stiffness: number; mass: number };
  transitionDuration: number;
  captionHighlightColor: string;
  captionBackgroundColor: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  "clean-professional": {
    primaryColor: "#2563EB",
    accentColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    surfaceColor: "#F9FAFB",
    textColor: "#1F2937",
    mutedTextColor: "#6B7280",
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    chartColors: ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4"],
    springConfig: { damping: 20, stiffness: 120, mass: 1 },
    transitionDuration: 0.4,
    captionHighlightColor: "#2563EB",
    captionBackgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  "flat-motion-graphics": {
    primaryColor: "#7C3AED",
    accentColor: "#EC4899",
    backgroundColor: "#0F172A",
    surfaceColor: "#1E293B",
    textColor: "#F8FAFC",
    mutedTextColor: "#94A3B8",
    headingFont: "Space Grotesk",
    bodyFont: "Space Grotesk",
    monoFont: "Fira Code",
    chartColors: ["#7C3AED", "#EC4899", "#06B6D4", "#F59E0B", "#10B981", "#EF4444"],
    springConfig: { damping: 12, stiffness: 80, mass: 1 },
    transitionDuration: 0.3,
    captionHighlightColor: "#22D3EE",
    captionBackgroundColor: "rgba(15, 23, 42, 0.75)",
  },
  "minimalist-diagram": {
    primaryColor: "#1A1A2E",
    accentColor: "#E94560",
    backgroundColor: "#FAFAFA",
    surfaceColor: "#FFFFFF",
    textColor: "#1A1A2E",
    mutedTextColor: "#6B7280",
    headingFont: "IBM Plex Sans",
    bodyFont: "IBM Plex Sans",
    monoFont: "IBM Plex Mono",
    chartColors: ["#E94560", "#1A1A2E", "#0F3460", "#9CA3AF"],
    springConfig: { damping: 25, stiffness: 150, mass: 1 },
    transitionDuration: 0.5,
    captionHighlightColor: "#E94560",
    captionBackgroundColor: "rgba(250, 250, 250, 0.9)",
  },
  "anime-ghibli": {
    primaryColor: "#2D5016",
    accentColor: "#FFB347",
    backgroundColor: "#0A0A1A",
    surfaceColor: "#1A2332",
    textColor: "#F0E6D3",
    mutedTextColor: "#A8957E",
    headingFont: "Noto Serif JP",
    bodyFont: "Noto Sans",
    monoFont: "Fira Code",
    chartColors: ["#FFB347", "#2D5016", "#FF6B9D", "#A8E6CF", "#6B4C8A", "#E8927C"],
    springConfig: { damping: 18, stiffness: 60, mass: 1 },
    transitionDuration: 1.0,
    captionHighlightColor: "#FFB347",
    captionBackgroundColor: "rgba(10, 10, 26, 0.8)",
  },
};

// Default theme when none is specified — uses the existing dark style for backwards compatibility
export const DEFAULT_THEME = THEMES["flat-motion-graphics"];

export function resolveTheme(props: Record<string, unknown>): ThemeConfig {
  const themeName = (props.theme as string) || (props.playbook as string);
  if (themeName && THEMES[themeName]) {
    return THEMES[themeName];
  }
  // Allow custom theme passed as full object
  if (props.themeConfig && typeof props.themeConfig === "object") {
    return { ...DEFAULT_THEME, ...(props.themeConfig as Partial<ThemeConfig>) };
  }
  return DEFAULT_THEME;
}

const calculateMetadata: CalculateMetadataFunction<ExplainerProps> = async ({
  props,
}) => {
  const cuts = props.cuts || [];
  if (cuts.length === 0) {
    return { durationInFrames: 30 * 60 };
  }
  const lastEnd = Math.max(...cuts.map((c) => c.out_seconds || 0));
  // Add 1 second padding for final fade
  return { durationInFrames: Math.ceil((lastEnd + 1) * 30) };
};

export const Root: React.FC = () => {
  const calcShowcaseMeta = ({ props }: { props: ShowcaseVideoProps }) => ({
    durationInFrames: Math.max(
      1,
      Math.ceil((props.durationSeconds || 69) * 30)
    ),
  });

  const defaultShowcaseProps: ShowcaseVideoProps = {
    durationSeconds: 69,
    narrationSrc: "episodes/reactive-mind/narration.mp3",
    musicSrc: "episodes/reactive-mind/ambient_music.wav",
    captions: [],
  };

  return (
    <>
      <Composition
        id="TurboFlowOmniFlash9x16"
        component={TurboFlowOmniFlash9x16}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: TurboFlowOmniFlash9x16Props;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="StickmanFullMotion9x16"
        component={StickmanFullMotion9x16}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: StickmanFullMotion9x16Props;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="StickmanB1Director"
        component={StickmanB1Director}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: StickmanB1DirectorProps;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="CarterSelfDevStyle9x16"
        component={CarterSelfDevStyle9x16}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: CarterSelfDevProps;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="MochiCarterVertical9x16"
        component={MochiCarterVertical9x16}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: CarterSelfDevProps;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="CrayonDoodle9x16"
        component={CrayonDoodle9x16}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: CrayonDoodle9x16Props;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="MochiVertical9x16"
        component={MochiVertical9x16}
        durationInFrames={30 * 90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 90,
        }}
        calculateMetadata={({
          props,
        }: {
          props: MochiVertical9x16Props;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 90) * 30)
          ),
        })}
      />
      <Composition
        id="CharacterSelectionBoard"
        component={CharacterSelectionBoard}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          mode: "all" as const,
        }}
      />
      <Composition
        id="PhatBieuCartoon2D"
        component={PhatBieuCartoon2D}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          durationSeconds: 69,
          narrationSrc: "episodes/reactive-mind/narration.mp3",
          musicSrc: "episodes/reactive-mind/tiktok_newpulse_bgm.wav",
        }}
        calculateMetadata={({
          props,
        }: {
          props: PhatBieuCartoon2DProps;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 69) * 30)
          ),
        })}
      />
      <Composition
        id="TiktokVerticalBespoke"
        component={TiktokVerticalBespoke}
        durationInFrames={30 * 69}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          durationSeconds: 69,
          narrationSrc: "episodes/reactive-mind/narration.mp3",
          musicSrc: "episodes/reactive-mind/tiktok_newpulse_bgm.wav",
          captions: [],
        }}
        calculateMetadata={({
          props,
        }: {
          props: TiktokVerticalBespokeProps;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 69) * 30)
          ),
        })}
      />
      <Composition
        id="Loai07CollageBurst"
        component={Loai07CollageBurst}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="Loai08UIChatSim"
        component={Loai08UIChatSim}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="Loai09PoeticQuote"
        component={Loai09PoeticQuote}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="Loai10BookReveal"
        component={Loai10BookReveal}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="Loai11DanKoeSketch"
        component={Loai11DanKoeSketch}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="Loai12SplitRoleplay"
        component={Loai12SplitRoleplay}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="Loai13PodcastAudiogram"
        component={Loai13PodcastAudiogram}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultShowcaseProps}
        calculateMetadata={calcShowcaseMeta}
      />
      <Composition
        id="ReactiveMindAtelier"
        component={ReactiveMindAtelier}
        durationInFrames={30 * 69}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          durationSeconds: 69,
          narrationSrc: "episodes/reactive-mind/narration.mp3",
          musicSrc: "episodes/reactive-mind/ambient_music.wav",
          captions: [],
        }}
        calculateMetadata={({
          props,
        }: {
          props: ReactiveMindAtelierProps;
        }) => ({
          durationInFrames: Math.max(
            1,
            Math.ceil((props.durationSeconds || 69) * 30)
          ),
        })}
      />
      <Composition
        id="InnerThoughtsEpisode"
        component={InnerThoughtsEpisode}
        durationInFrames={30 * 60}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{durationSeconds: 60, narration: "", music: "", fontRegular: "", fontSemibold: "", chapters: [], beats: [], captions: []}}
        calculateMetadata={({props}: {props: InnerThoughtsProps}) => ({durationInFrames: Math.max(1, Math.ceil(props.durationSeconds * 30))})}
      />
      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={30 * 60}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          cuts: [],
          overlays: [],
          captions: [],
          audio: {},
        }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="CinematicRenderer"
        component={CinematicRenderer}
        durationInFrames={30 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: [],
          titleFontSize: 78,
          titleWidth: 1320,
          signalLineCount: 18,
        }}
        calculateMetadata={calculateCinematicMetadata}
      />
      <Composition
        id="SignalFromTomorrowWithMusic"
        component={CinematicRenderer}
        durationInFrames={30 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={signalFromTomorrowWithMusicFixture}
        calculateMetadata={calculateCinematicMetadata}
      />
      <Composition
        id="TalkingHead"
        component={TalkingHead}
        durationInFrames={30 * 69}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: "",
          captions: [],
          overlays: [],
          wordsPerPage: 4,
          fontSize: 52,
          highlightColor: "#22D3EE",
        }}
        calculateMetadata={calculateTalkingHeadMetadata}
      />
      <Composition
        id="TitledVideo"
        component={TitledVideo}
        durationInFrames={30 * 60}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "",
          tagline: "home is a verb.",
          taglineInSeconds: 53.5,
          taglineOutSeconds: undefined,
          topPx: 150,
          fontSize: 148,
          accentColor: "#F5C470",
        }}
        calculateMetadata={calculateTitledVideoMetadata}
      />
      <Composition
        id="HeroTitle"
        component={HeroTitle}
        durationInFrames={30 * 17}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "THE CALIBRATORS",
          subtitle: "The People Who Define Reality",
        }}
      />
      <Composition
        id="ProductReveal"
        component={ProductReveal}
        durationInFrames={30 * 8}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          productImage: "airnothing/product.png",
          productName: "AirNothing Pro Max Ultra",
          price: "Starting at $999",
          tagline: "Nothing included.",
          closer: "Less is nothing.",
          accentColor: "#00D4FF",
        } as ProductRevealProps}
      />
      <Composition
        id="ProductRevealVertical"
        component={ProductReveal}
        durationInFrames={30 * 8}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{
          productImage: "airnothing/product.png",
          productName: "AirNothing Pro Max Ultra",
          price: "Starting at $999",
          tagline: "Nothing included.",
          closer: "Less is nothing.",
          accentColor: "#00D4FF",
        } as ProductRevealProps}
      />
      <Composition
        id="CaptionOverlayOnly"
        component={CaptionOverlay}
        durationInFrames={30 * 300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          words: [] as WordCaption[],
          wordsPerPage: 3,
          fontSize: 58,
          highlightColor: "#FACC15",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
        }}
      />
      <Composition
        id="CollageBurst"
        component={CollageBurst}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          backgroundSrc: "",
          backgroundInSeconds: 0,
          curtainStartSeconds: 1.5,
          curtainEndSeconds: 3.0,
          clips: [],
        } as CollageBurstProps}
      />
      <Composition
        id="LyricOverlay"
        component={LyricOverlay}
        durationInFrames={30 * 28}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: "",
          lyrics: [],
          bottomY: 0.88,
        } as LyricOverlayProps}
      />
      <Composition
        id="EndTag"
        component={EndTag}
        // 5.5s at 30fps = 165 frames. Render CLI can override via --props.
        durationInFrames={165}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          text: "THE CITY KEEPS ITS OWN VIGIL.",
          palette: "cool_offwhite_on_black",
          fadeInSeconds: 0.6,
          holdSeconds: 4.3,
          fadeOutSeconds: 0.6,
        } as EndTagProps}
      />
      <Composition
        id="EndTagOverlay"
        component={EndTag}
        // 8.19s at 30fps = 246 frames. Render CLI can override via --props.
        // Intended to be composited on top of body footage, not concat'd.
        durationInFrames={246}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          text: "EARN THE LIGHT.",
          palette: "cool_offwhite_on_black",
          fadeInSeconds: 1.0,
          holdSeconds: 5.69,
          fadeOutSeconds: 1.5,
          overlay: true,
        } as EndTagProps}
      />
      <Composition
        id="BeMochiEp01Horizontal16x9"
        component={BeMochiEp01Master}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          orientation: "16:9",
          useOmniFlashClips: false,
        } as BeMochiEp01Props}
      />
      <Composition
        id="BeMochiEp01Vertical9x16"
        component={BeMochiEp01Master}
        durationInFrames={2700}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          orientation: "9:16",
          visualMode: "svg",
          useOmniFlashClips: false,
        } as BeMochiEp01Props}
      />
      <Composition
        id="BeMochiEp01Crayon16x9"
        component={BeMochiEp01Master}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          orientation: "16:9",
          visualMode: "crayon",
          useOmniFlashClips: false,
        } as BeMochiEp01Props}
      />
      <Composition
        id="BeMochiEp01Crayon9x16"
        component={BeMochiEp01Master}
        durationInFrames={2700}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          orientation: "9:16",
          visualMode: "crayon",
          useOmniFlashClips: false,
        } as BeMochiEp01Props}
      />
      <Composition
        id="BeMochiEp01OmniFlash16x9"
        component={BeMochiEp01Master}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          orientation: "16:9",
          visualMode: "omniflash",
          useOmniFlashClips: true,
        } as BeMochiEp01Props}
      />
      <Composition
        id="BeMochiEp01OmniFlash9x16"
        component={BeMochiEp01Master}
        durationInFrames={2700}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          orientation: "9:16",
          visualMode: "omniflash",
          useOmniFlashClips: true,
        } as BeMochiEp01Props}
      />
      <Composition
        id="BeMochi5StatesIllustrated"
        component={BeMochi5StatesShowcase}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ mode: "illustrated" as const }}
      />
      <Composition
        id="BeMochi5StatesSvgRig"
        component={BeMochi5StatesShowcase}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ mode: "svg" as const }}
      />
      <Composition
        id="BeMochiEp01Full16x9"
        component={BeMochiEp01Full16x9}
        durationInFrames={17700}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          clipFolder: "episodes/mochi-ep01-full",
        } as BeMochiEp01FullProps}
      />
      <MochiLocalDemoRoot />
      <MochiThreeStylesRoot />
      <HumanReferenceRoot />
      <PaperPuppetRoot />
      <OpenPeepsRoot />
      <BridgeRoot />
    </>
  );
};
