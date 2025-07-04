import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "";

if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL environment variable. " +
      "Run 'bun convex dev' to set up your Convex deployment."
  );
}

export const convex = new ConvexReactClient(convexUrl);
