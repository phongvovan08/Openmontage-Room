import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

let fontsLoadedPromise: Promise<void> | null = null;

function ensureLocalFontsLoaded(): Promise<void> {
  if (fontsLoadedPromise) {
    return fontsLoadedPromise;
  }
  if (typeof document === "undefined" || typeof FontFace === "undefined") {
    fontsLoadedPromise = Promise.resolve();
    return fontsLoadedPromise;
  }

  const specs = [
    {
      family: "BeVietnamProLocal",
      url: staticFile("fonts/BeVietnamPro-Regular.ttf"),
      weight: "400",
    },
    {
      family: "BeVietnamProLocal",
      url: staticFile("fonts/BeVietnamPro-Medium.ttf"),
      weight: "500",
    },
    {
      family: "BeVietnamProLocal",
      url: staticFile("fonts/BeVietnamPro-SemiBold.ttf"),
      weight: "600",
    },
    {
      family: "BeVietnamProLocal",
      url: staticFile("fonts/BeVietnamPro-Bold.ttf"),
      weight: "700",
    },
    {
      family: "BeVietnamProLocal",
      url: staticFile("fonts/BeVietnamPro-ExtraBold.ttf"),
      weight: "800",
    },
    {
      family: "IBMPlexMonoLocal",
      url: staticFile("fonts/IBMPlexMono-Medium.ttf"),
      weight: "500",
    },
    {
      family: "IBMPlexMonoLocal",
      url: staticFile("fonts/IBMPlexMono-Bold.ttf"),
      weight: "700",
    },
    {
      family: "TechMonoLocal",
      url: staticFile("fonts/TechMono.ttf"),
      weight: "400",
    },
  ];

  fontsLoadedPromise = Promise.all(
    specs.map(async (s) => {
      const face = new FontFace(s.family, `url("${s.url}")`, {
        weight: s.weight,
        style: "normal",
      });
      const loaded = await face.load();
      document.fonts.add(loaded);
    })
  ).then(() => undefined);

  return fontsLoadedPromise;
}

export function useHydrographicFonts(): boolean {
  const [handle] = useState(() => delayRender("Loading offline Vietnamese editorial fonts"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureLocalFontsLoaded()
      .then(() => {
        if (!cancelled) {
          setReady(true);
          continueRender(handle);
        }
      })
      .catch((err) => {
        console.error("Font load error:", err);
        if (!cancelled) {
          setReady(true);
          continueRender(handle);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return ready;
}
