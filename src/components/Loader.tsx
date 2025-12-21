export default function Loader({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>{message || "Loading..."}</p>
      </div>
    </div>
  );
}
