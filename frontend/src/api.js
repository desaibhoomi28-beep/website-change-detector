const API_URL =
  "http://localhost:5000/api";


/* =========================================================
   GET PAGES
========================================================= */

export async function getPages() {
  const response = await fetch(
    `${API_URL}/pages`
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to load tracked pages"
    );
  }

  return data;
}


/* =========================================================
   CREATE PAGE
========================================================= */

export async function createPage(
  name,
  url
) {
  const response = await fetch(
    `${API_URL}/pages`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name,
        url,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to add website"
    );
  }

  return data;
}


/* =========================================================
   DELETE PAGE
========================================================= */

export async function deletePage(id) {
  const response = await fetch(
    `${API_URL}/pages/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to delete website"
    );
  }

  return data;
}


/* =========================================================
   CHECK PAGE
========================================================= */

export async function checkPage(id) {
  const response = await fetch(
    `${API_URL}/pages/${id}/check`,
    {
      method: "POST",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to check website"
    );
  }

  return data;
}


/* =========================================================
   GET PAGE
========================================================= */

export async function getPage(id) {
  const response = await fetch(
    `${API_URL}/pages/${id}`
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to load page details"
    );
  }

  return data;
}


/* =========================================================
   GET CHANGES TODAY
========================================================= */

export async function getChangesToday() {
  const response = await fetch(
    `${API_URL}/pages/stats/changes-today`
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to fetch today's changes"
    );
  }

  return data;
}


/* =========================================================
   GET ALL CHANGES
========================================================= */

export async function getAllChanges() {
  const response = await fetch(
    `${API_URL}/pages/changes/all`
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to fetch changes"
    );
  }

  return data;
}