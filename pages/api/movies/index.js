export default async function handler(request, response) {
  const { search } = request.query;
  const api_key = process.env.tmdbApiKey;

  console.log(new URLSearchParams({ query: search, api_key }));

  if (request.method === "GET") {
    const result = await fetch(
      `https://api.themoviedb.org/3/search/movie?${new URLSearchParams({
        query: search,
        api_key,
      })}`
    );
  
    const data = await result.json();

    if (!data) {
      return response.status(404).json({ status: "404 Not Found" });
    }

   response.json(data);
  }

}