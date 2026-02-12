export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-[#0A0A0F]">D</span>
        </div>
        <div className="h-6 w-6 rounded-full border-2 border-[#27272A] border-t-[#FFD700] animate-spin" />
      </div>
    </div>
  );
}
