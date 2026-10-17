// ChatGPT Sites stays a private review surface. Google credentials belong only
// to the separately deployed Cloud Run service, never to this browser build.
export async function GET() {
  return Response.json(
    {
      provider: 'google-gemini',
      configured: false,
      model: null,
      hosting: 'sites',
      liveVerified: false,
      message:
        'Gemini runs on the separate Google Cloud deployment. This private Site uses local records.',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
