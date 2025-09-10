export function FuturisticBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
      <div className="absolute bottom-[-20%] left-[-20%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(190,41,236,0.15),rgba(255,255,255,0))] md:h-[600px] md:w-[600px]"></div>
      <div className="absolute right-[-20%] top-[-20%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(41,236,204,0.15),rgba(255,255,255,0))] md:h-[600px] md:w-[600px]"></div>
    </div>
  );
}
