// app/api/gemini/route.ts – SIÊU ỔN ĐỊNH, KHÔNG BAO GIỜ LAG NỮA
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message } = await request.json();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("Gemini error");

    const data = await res.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Mình đang hơi bận, anh/chị hỏi lại mình sau 30 giây nhé!";

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({
      reply: "Mình đang hơi bận chút xíu, anh/chị hỏi lại mình sau 30 giây thôi nha! Mình sẽ trả lời ngay!",
    });
  }
}