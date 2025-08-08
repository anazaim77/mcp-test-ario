const checkIsLoggedIn = async (): Promise<boolean> => {
  const url = `http://localhost:4004/scraper/tokopedia/check-is-logged-in`;
  const response = await fetch(url, {
    method: "GET",
  });
  return response.ok;
};

export { checkIsLoggedIn };
