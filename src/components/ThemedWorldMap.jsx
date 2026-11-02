import { useRef } from "react";
import { ArrowLeft, ArrowRight, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import orchardWorld from "@/assets/world-orchard.jpg";
import desertWorld from "@/assets/world-desert.jpg";
import coastWorld from "@/assets/world-coast.jpg";
import { getStarsFromScore, wrapLevelsWithStatus } from "@/utils/gameHelpers";

const worlds = [
  { image: orchardWorld, name: "Olive Grove" },
  { image: desertWorld, name: "Judean Highlands" },
  { image: coastWorld, name: "Sea of Galilee" },
];

const nodePositions = [
  { x: 28, y: 86 },
  { x: 40, y: 76 },
  { x: 61, y: 68 },
  { x: 73, y: 59 },
  { x: 65, y: 50 },
  { x: 48, y: 42 },
  { x: 33, y: 34 },
  { x: 28, y: 25 },
  { x: 43, y: 17 },
  { x: 62, y: 9 },
];

export default function ThemedWorldMap({
  phase,
  phaseIndex,
  totalPhases,
  completedLevels,
  levelScores,
  isPhaseUnlocked,
  currentLevelId,
  currentAvatar,
  totalCompleted,
  totalLevels,
  levelRefs,
  shakingLevel,
  onLockedClick,
  onPlayLevel,
  onPreviousPhase,
  onNextPhase,
}) {
  const swipeStartX = useRef(null);
  const world = worlds[phaseIndex % worlds.length];
  const wrappedLevels = wrapLevelsWithStatus(phaseIndex, phase, completedLevels, [phase]);
  const phaseCompleted = wrappedLevels.filter((level) => completedLevels.includes(level.id)).length;
  const phaseProgress = Math.round((phaseCompleted / Math.max(wrappedLevels.length, 1)) * 100);
  const overallProgress = Math.round((totalCompleted / Math.max(totalLevels, 1)) * 100);
  const routePoints = wrappedLevels.map((_, index) => nodePositions[index] || { x: 50, y: 10 });
  const routePath = routePoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  const handleSwipeEnd = (event) => {
    if (swipeStartX.current === null) return;
    const delta = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(delta) < 55) return;
    if (delta < 0) onNextPhase();
    else onPreviousPhase();
  };

  return (
    <section
      className="world-map-scene relative flex h-full min-h-[390px] w-full flex-col overflow-hidden"
      aria-label={`World map: phase ${phase.phaseNumber}, ${phase.title}`}
      onPointerDown={(event) => { swipeStartX.current = event.clientX; }}
      onPointerUp={handleSwipeEnd}
      onPointerCancel={() => { swipeStartX.current = null; }}
    >
      <img
        key={world.image}
        src={world.image}
        alt={`${world.name} biblical adventure landscape`}
        width={1280}
        height={1024}
        loading="eager"
        fetchPriority="high"
        draggable="false"
        className="world-map-image absolute inset-0 h-full w-full select-none object-cover"
      />

      <header className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 sm:inset-x-6 sm:top-5">
        <div className="max-w-[min(70%,34rem)] rounded-lg border border-world-cream/60 bg-world-ink/80 px-3 py-2 text-world-cream shadow-lg backdrop-blur-sm sm:px-5 sm:py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-extrabold uppercase text-world-gold sm:text-sm">
            <span>{world.name}</span>
            <span aria-hidden="true">·</span>
            <span>World {Math.floor(phaseIndex / worlds.length) + 1}</span>
            {!isPhaseUnlocked && <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Locked</span>}
          </div>
          <h1 className="mt-0.5 break-words text-sm font-black leading-tight sm:text-xl">{phase.title}</h1>
          <p className="mt-1 text-[11px] font-semibold text-world-cream/90 sm:text-xs">
            Phase {phase.phaseNumber} of {totalPhases} · {phaseCompleted}/{wrappedLevels.length} levels complete
          </p>
        </div>
        <div className="min-w-16 rounded-lg border border-world-cream/50 bg-world-ink/80 px-2 py-2 text-center text-world-cream shadow-lg backdrop-blur-sm sm:min-w-20 sm:px-3">
          <span className="block text-[10px] font-bold uppercase text-world-gold sm:text-xs">Journey</span>
          <span className="block text-lg font-black leading-tight sm:text-xl">{overallProgress}%</span>
          <span className="block text-[9px] font-semibold sm:text-[10px]">{totalCompleted}/{totalLevels}</span>
        </div>
      </header>

      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={routePath} className="world-map-route" />
        {wrappedLevels.slice(0, -1).map((level, index) => {
          const nextLevel = wrappedLevels[index + 1];
          if (!completedLevels.includes(level.id) || !completedLevels.includes(nextLevel.id)) return null;
          const from = routePoints[index];
          const to = routePoints[index + 1];
          return <path key={`${level.id}-route`} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} className="world-map-route-complete" />;
        })}
      </svg>

      {wrappedLevels.map((level, index) => {
        const isCompleted = completedLevels.includes(level.id);
        const isCurrent = currentLevelId === level.id;
        const isUnlocked = isPhaseUnlocked && (index === 0 || completedLevels.includes(wrappedLevels[index - 1]?.id));
        const stars = getStarsFromScore(levelScores[level.id] || 0);
        const position = routePoints[index];

        return (
          <div
            key={level.id}
            ref={(element) => { levelRefs.current[level.id] = element; }}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            {isCurrent && (
              <div className="absolute -top-11 flex flex-col items-center gap-0.5 sm:-top-14">
                <span className="text-2xl drop-shadow-md sm:text-3xl" aria-label="Your current level">{currentAvatar}</span>
                <span className="rounded-full border border-world-cream/70 bg-world-gold px-2 py-0.5 text-[9px] font-black text-world-ink shadow">YOU</span>
              </div>
            )}
            <Button
              type="button"
              aria-label={`${isUnlocked ? (isCompleted ? "Replay" : "Play") : "Locked"} phase ${phase.phaseNumber}, level ${level.number}${index === wrappedLevels.length - 1 ? ", phase reward chest" : ""}; ${stars} of 3 stars`}
              onClick={() => isUnlocked ? onPlayLevel(level) : onLockedClick(level.id)}
              className={`level-node-3d sm relative h-11 w-11 rounded-full border-2 border-world-cream p-0 text-base font-black text-white shadow-lg sm:h-14 sm:w-14 sm:text-xl ${!isUnlocked ? "is-locked" : ""} ${isCompleted ? "is-completed" : ""} ${isCurrent ? "is-current glow-ring ring-4 ring-world-gold/80" : ""} ${shakingLevel === level.id ? "animate-wiggle" : ""}`}
            >
              {level.number}
              {!isUnlocked && <Lock className="absolute -left-1 -top-1 h-4 w-4 rounded-full border border-white bg-world-ink p-0.5 text-world-cream sm:h-5 sm:w-5" />}
              {index === wrappedLevels.length - 1 && (
                <span aria-hidden="true" className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-world-cream bg-world-gold text-sm shadow-md">🎁</span>
              )}
            </Button>
            <span className="mt-1 flex items-center gap-0.5 rounded-full border border-world-cream/50 bg-world-ink/80 px-1.5 py-0.5 shadow-sm" aria-label={`${stars} of 3 stars`}>
              {[0, 1, 2].map((starIndex) => (
                <Star key={starIndex} className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${starIndex < stars ? "fill-world-gold text-world-gold" : "fill-none text-world-cream/80"}`} aria-hidden="true" />
              ))}
            </span>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPreviousPhase}
        disabled={phaseIndex === 0}
        aria-label="Previous world"
        className="absolute left-2 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full border-2 border-world-cream bg-world-ink/85 text-world-cream shadow-lg hover:bg-world-ink disabled:opacity-40 sm:left-5 sm:h-14 sm:w-14"
      >
        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNextPhase}
        disabled={phaseIndex === totalPhases - 1}
        aria-label="Next world"
        className="absolute right-2 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full border-2 border-world-cream bg-world-ink/85 text-world-cream shadow-lg hover:bg-world-ink disabled:opacity-40 sm:right-5 sm:h-14 sm:w-14"
      >
        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      <footer className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-6 sm:bottom-5">
        <div className="ml-auto max-w-64 rounded-full border border-world-cream/60 bg-world-ink/80 px-3 py-2 text-world-cream shadow-lg backdrop-blur-sm sm:max-w-80">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold sm:text-xs">
            <span>World progress</span>
            <span>{phaseProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-world-cream/30">
            <div className="h-full rounded-full bg-world-gold transition-[width] duration-500" style={{ width: `${phaseProgress}%` }} />
          </div>
        </div>
      </footer>
    </section>
  );
}