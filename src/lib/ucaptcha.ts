import { VdfSolver } from "@ucaptcha/js";

interface NewCaptcha {
    id: string;
    g: string;
    T: string;
    N: string;
}

export const getNewCaptcha = async (action: "upload-files" | "submit"): Promise<NewCaptcha> => {
    const url = `https://ucaptcha.projectcvsa.com/challenge/new?siteKey=WmJvvB2R&resource=${action}`;
    const res = await fetch(url);
    return res.json();
}

export const solveAndSubmit = async (captcha: NewCaptcha): Promise<string> => {
    const { id, g, T, N } = captcha;
    const url = `https://ucaptcha.projectcvsa.com/challenge/${id}/answer`;
    const solver = new VdfSolver();
    const result = await solver.compute(g, N, parseInt(T, 10));
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            answer: result,
        }),
    });
    const data = await response.json();
    return data.token;
}