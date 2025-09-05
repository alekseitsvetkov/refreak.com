import "./env.mjs"
import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
};

const withNextIntl = createNextIntlPlugin();

export default withContentlayer(withNextIntl(nextConfig))