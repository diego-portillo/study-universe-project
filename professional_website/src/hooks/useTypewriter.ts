import { useEffect, useState } from 'react';

const TYPE_SPEED_MS = 40;
const PAUSE_BETWEEN_STEPS_MS = 500;

interface TypewriterState {
  title1: string;
  title2: string;
  title2Started: boolean;
  subtitleTexts: string[];
  subtitleStarted: boolean[];
  iconsVisible: boolean;
}

function initialState(subtitlePartCount: number): TypewriterState {
  return {
    title1: '',
    title2: '',
    title2Started: false,
    subtitleTexts: Array<string>(subtitlePartCount).fill(''),
    subtitleStarted: Array<boolean>(subtitlePartCount).fill(false),
    iconsVisible: false,
  };
}

/** Types out a string onto a setter, one character at a time, calling onDone when finished. */
function typeInto(
  text: string,
  isActive: () => boolean,
  onUpdate: (partial: string) => void,
  onDone: () => void,
) {
  let i = 0;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  function typeNext() {
    if (!isActive()) return;
    if (i >= text.length) {
      timeouts.push(setTimeout(onDone, PAUSE_BETWEEN_STEPS_MS));
      return;
    }
    i += 1;
    onUpdate(text.slice(0, i));
    timeouts.push(setTimeout(typeNext, TYPE_SPEED_MS));
  }

  typeNext();
  return () => timeouts.forEach(clearTimeout);
}

/** Replicates the original app.js typewriter sequence: title1 -> title2 -> each subtitle part -> icon fade-in. */
export function useTypewriter(
  titleLines: [string, string],
  subtitleParts: readonly string[],
) {
  const [state, setState] = useState<TypewriterState>(() =>
    initialState(subtitleParts.length),
  );

  useEffect(() => {
    let active = true;
    const cleanups: (() => void)[] = [];
    setState(initialState(subtitleParts.length));

    cleanups.push(
      typeInto(
        titleLines[0],
        () => active,
        (partial) => setState((s) => ({ ...s, title1: partial })),
        () => {
          if (!active) return;
          setState((s) => ({ ...s, title2Started: true }));
          cleanups.push(
            typeInto(
              titleLines[1],
              () => active,
              (partial) => setState((s) => ({ ...s, title2: partial })),
              () => {
                if (!active) return;
                const typeSubtitlePart = (index: number) => {
                  if (!active || index >= subtitleParts.length) {
                    if (active) setState((s) => ({ ...s, iconsVisible: true }));
                    return;
                  }
                  setState((s) => {
                    const subtitleStarted = [...s.subtitleStarted];
                    subtitleStarted[index] = true;
                    return { ...s, subtitleStarted };
                  });
                  cleanups.push(
                    typeInto(
                      subtitleParts[index],
                      () => active,
                      (partial) =>
                        setState((s) => {
                          const subtitleTexts = [...s.subtitleTexts];
                          subtitleTexts[index] = partial;
                          return { ...s, subtitleTexts };
                        }),
                      () => typeSubtitlePart(index + 1),
                    ),
                  );
                };
                typeSubtitlePart(0);
              },
            ),
          );
        },
      ),
    );

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleLines[0], titleLines[1], subtitleParts.join('|')]);

  return state;
}
