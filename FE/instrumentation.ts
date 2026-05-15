// Runs once when the Next.js server starts — warms up the mock DB
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getStoryList } = await import('./lib/mock-db')
    await getStoryList()
  }
}
