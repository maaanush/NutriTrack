export default function ProcessingDialog() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Processing your recording...</h3>
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
        <p className="mt-4 text-center text-neutral-400">Transcribing and analyzing your food</p>
      </div>
    </div>
  );
}
