import { error } from "console";
import { ElementHandle, chromium } from "playwright";

const buttonSelector = {
  emailInput: "input[name='email']",
  passwordInput: "input[name='password']", // 실제 비밀번호 입력 필드의 selector로 변경해야 합니다.
  submitButton: 'button[type="submit"]',
};

export async function RocketPunchLoginCheck(email: string, password: string) {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  try {
    await page.goto("https://www.rocketpunch.com/login");
    console.log("1");

    // 이메일 입력
    await (await page.waitForSelector(buttonSelector.emailInput)).type(email);
    console.log("2");

    // 비밀번호 입력
    await (
      await page.waitForSelector(buttonSelector.passwordInput)
    ).type(password);
    console.log("3");

    // 로그인 버튼 클릭 전에 참조 저장
    const submitButton = await page.waitForSelector(
      buttonSelector.submitButton,
    );

    // 로그인 시도
    await submitButton.click();
    console.log("4");

    // 재시도 버튼이 나타날 때까지 대기
    await page.waitForTimeout(2000); //혹시나 네트워크가 느린 경우에는 초를 늘려줘야함

    // 클릭 후 버튼의 텍스트 확인
    const currentUrl = await page.url();
    console.log("===========> ~ currentUrl:", currentUrl)

    let buttonTextAfterClick = null;
    if (currentUrl === "https://www.rocketpunch.com/") {
      console.log("7");
      console.log("로그인 성공");
      await browser.close();
      return true;
    }
    try {
      // 재시도 버튼을 다시 찾아냅니다.
      const retryButton = await page.waitForSelector(
        buttonSelector.submitButton,
      );
      console.log("5");
      buttonTextAfterClick = await retryButton.textContent();
    } catch (e) {
      console.log("버튼 텍스트 가져오기 실패");
    }

    if (buttonTextAfterClick === "재시도") {
      console.log("6");
      console.log("로그인 실패 콘솔");
      await browser.close();
      throw new Error("로그인 실패");
    }
    
    
  } catch (error) {
    console.error(error);
    console.log("8");
    await browser.close();
    console.log("try-catch, 로그인 실패");
    return false;
  }
}