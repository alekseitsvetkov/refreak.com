import { ImageResponse } from "@vercel/og"

import { ogImageSchema } from "@/lib/validations/og"

export const runtime = "edge"

const interRegular = fetch(
  new URL("../../../assets/fonts/Inter-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer())

const interBold = fetch(
  new URL("../../../assets/fonts/CalSans-SemiBold.ttf", import.meta.url)
).then((res) => res.arrayBuffer())

export async function GET(req: Request) {
  try {
    const fontRegular = await interRegular
    const fontBold = await interBold

    const url = new URL(req.url)
    const values = ogImageSchema.parse(Object.fromEntries(url.searchParams))
    const heading =
      values.heading.length > 140
        ? `${values.heading.substring(0, 140)}...`
        : values.heading

    const { mode, bg } = values
    const paint = mode === "dark" ? "#fff" : "#000"

    const fontSize = heading.length > 100 ? "100px" : "130px"

    return new ImageResponse(
      (
        <div
          tw="flex relative w-full h-full items-center"
          style={{
            color: paint,
            background:
              mode === "dark"
                ? "linear-gradient(90deg, #000 0%, #111 100%)"
                : "white",
          }}
        >
          {bg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bg}
              tw="absolute inset-0 w-full h-full object-cover"
              alt=""
            />
          ) : null}
          
          <div tw="flex items-center justify-center w-full text-center p-20">
            <div
              tw="flex leading-[1.1] text-[80px] font-bold text-center mx-auto"
              style={{
                fontFamily: "Cal Sans",
                fontWeight: "bold",
                marginLeft: "-3px",
                fontSize,
              }}
            >
              {heading}
            </div>
          </div>
        </div>
      ),
      {
        width: 2000,
        height: 1260,
        fonts: [
          {
            name: "Inter",
            data: fontRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Cal Sans",
            data: fontBold,
            weight: 700,
            style: "normal",
          },
        ],
      }
    )
  } catch (error) {
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
