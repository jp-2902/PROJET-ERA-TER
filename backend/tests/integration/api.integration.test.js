const test =
  require("node:test");

const assert =
  require("node:assert/strict");

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_URL =
  process.env.TEST_API_URL ||
  "http://localhost:5001";

// ============================================================
// HELPER
// ============================================================

async function request(
  path,
  options = {}
) {
  const response =
    await fetch(
      `${BASE_URL}${path}`,
      options
    );

  let body =
    null;

  try {
    body =
      await response.json();
  } catch {
    body =
      null;
  }

  return {
    response,
    body,
  };
}

// ============================================================
// TEST 1
// BACKEND REACHABLE
// ============================================================

test(
  "API integration: backend must be reachable",
  async () => {
    const response =
      await fetch(
        BASE_URL
      );

    assert.ok(
      response.status >= 200
    );

    assert.ok(
      response.status < 500
    );
  }
);

// ============================================================
// TEST 2
// INVALID LOGIN
// ============================================================

test(
  "API integration: invalid login must be rejected",
  async () => {
    const {
      response,
    } =
      await request(
        "/api/auth/login",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              email:
                "not-existing-user@messina-gallery.test",

              password:
                "wrong-password",
            }),
        }
      );

    assert.ok(
      [
        400,
        401,
        404,
      ].includes(
        response.status
      )
    );
  }
);

// ============================================================
// TEST 3
// ADMIN ANALYTICS WITHOUT TOKEN
// ============================================================

test(
  "API integration: admin analytics must reject unauthenticated access",
  async () => {
    const {
      response,
    } =
      await request(
        "/api/admin/analytics?startDate=2026-01-01&endDate=2026-12-31"
      );

    assert.ok(
      [
        401,
        403,
      ].includes(
        response.status
      )
    );
  }
);

// ============================================================
// TEST 4
// ADMIN RANKINGS WITHOUT TOKEN
// ============================================================

test(
  "API integration: admin rankings must reject unauthenticated access",
  async () => {
    const {
      response,
    } =
      await request(
        "/api/admin/analytics/rankings?startDate=2026-01-01&endDate=2026-12-31"
      );

    assert.ok(
      [
        401,
        403,
      ].includes(
        response.status
      )
    );
  }
);

// ============================================================
// TEST 5
// INVALID ADMIN DATE RANGE WITHOUT TOKEN
// SECURITY MUST BE CHECKED FIRST
// ============================================================

test(
  "API integration: protected analytics must reject request before date processing",
  async () => {
    const {
      response,
    } =
      await request(
        "/api/admin/analytics?startDate=2026-12-31&endDate=2026-01-01"
      );

    assert.ok(
      [
        401,
        403,
      ].includes(
        response.status
      )
    );
  }
);

// ============================================================
// TEST 6
// UNKNOWN API ROUTE
// ============================================================

test(
  "API integration: unknown API route must not return success",
  async () => {
    const {
      response,
    } =
      await request(
        "/api/this-route-does-not-exist"
      );

    assert.ok(
      response.status >=
        400
    );
  }
);
