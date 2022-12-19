import { signup, login } from "./requests.js";
import { signupEl, loginEl, loginModalEl, validationEl, userInfoEl } from "./store.js";
import { editUser, authLogin } from "./requests.js";
import { alertModal } from "./main.js";
import { logout } from "./requests.js";

const state = {
  email: "",
  password: "",
  displayName: "",
};

// 로그인/회원가입 모달 visibility 조정
export async function renderLoginModal() {
  if (loginModalEl.loginBtnEl.textContent === "로그인/가입") {
    loginModalEl.backGround.style.visibility = "visible";
    loginModalEl.loginModal.style.visibility = "visible";
    document.querySelector(".close-login").addEventListener("click", () => {
      loginModalEl.backGround.style.visibility = "hidden";
      loginModalEl.loginModal.style.visibility = "hidden";
      validationStyle(validationEl.idErrorMsg, "remove", loginEl.idboxEl, "#999");
      loginEl.loginId.value = "";
      loginEl.loginPw.value = "";
    });
    document.querySelector(".signup").addEventListener("click", () => {
      loginModalEl.signupModal.style.visibility = "visible";
      loginModalEl.loginModal.style.visibility = "hidden";
      document.querySelector(".close-signup").addEventListener("click", () => {
        loginModalEl.backGround.style.visibility = "hidden";
        loginModalEl.signupModal.style.visibility = "hidden";
        validationStyle(validationEl.idErrorMsg, "remove", loginEl.idboxEl, "#999");
        validationStyle(validationEl.emailErrorMsg, "remove", validationEl.signupEmailBox, "#333");
        validationStyle(validationEl.pwLengthMsg, "remove", validationEl.signupPwBox, "#333");
        validationStyle(validationEl.pwErrorMsg, "remove", validationEl.signupRepwBox, "#333");
        loginEl.loginId.value = "";
        loginEl.loginPw.value = "";
        signupEl.emailInputEl.value = "";
        signupEl.passwordInputEl.value = "";
        signupEl.passwordcheckEl.value = "";
        signupEl.displayNameInputEl.value = "";
      });
    });
  } else {
    await logout();
  }
}

// 회원가입 전송
export async function createSubmitEvent(event) {
  event.preventDefault();
  state.email = signupEl.emailInputEl.value;
  state.password = signupEl.passwordInputEl.value;
  state.displayName = signupEl.displayNameInputEl.value;
  if (
    validationEl.exptext.test(signupEl.emailInputEl.value) &&
    signupEl.passwordInputEl.value.length >= 8 &&
    signupEl.passwordInputEl.value === signupEl.passwordcheckEl.value &&
    signupEl.displayNameInputEl.value
  ) {
    await signup(state.email, state.password, state.displayName);
  } else {
    showErrorBox(signupEl.signupErrorBox);
  }
}

// 유효성 검사 스타일
async function validationStyle(errormsg, type, element, color) {
  switch (type) {
    case "add":
      errormsg.classList.add("show");
      element.style.border = `1px solid ${color}`;
      break;
    case "remove":
      errormsg.classList.remove("show");
      element.style.border = `1px solid ${color}`;
      break;
    default:
      break;
  }
}

// 회원가입 유효성 검사
// 이메일
signupEl.emailInputEl.addEventListener("focusout", () => {
  if (signupEl.emailInputEl.value && !validationEl.exptext.test(signupEl.emailInputEl.value)) {
    validationStyle(validationEl.emailErrorMsg, "add", validationEl.signupEmailBox, "#ed234b");
  }
});
signupEl.emailInputEl.addEventListener("focusin", () => {
  validationStyle(validationEl.emailErrorMsg, "remove", validationEl.signupEmailBox, "#333");
});
// 비밀번호 8자리 이상
signupEl.passwordInputEl.addEventListener("focusout", () => {
  if (signupEl.passwordInputEl.value && signupEl.passwordInputEl.value.length < 8) {
    validationStyle(validationEl.pwLengthMsg, "add", validationEl.signupPwBox, "#ed234b");
  }
});
signupEl.passwordInputEl.addEventListener("focusin", () => {
  validationStyle(validationEl.pwLengthMsg, "remove", validationEl.signupPwBox, "#333");
});
// 비밀번호 확인
signupEl.passwordcheckEl.addEventListener("focusout", () => {
  if (signupEl.passwordInputEl.value !== signupEl.passwordcheckEl.value) {
    validationStyle(validationEl.pwErrorMsg, "add", validationEl.signupRepwBox, "#ed234b");
  }
});
signupEl.passwordcheckEl.addEventListener("focusin", () => {
  validationStyle(validationEl.pwErrorMsg, "remove", validationEl.signupRepwBox, "#333");
});

// 로그인
export async function createLoginEvent(event) {
  event.preventDefault();
  state.email = loginEl.loginId.value;
  state.password = loginEl.loginPw.value;
  if (validationEl.exptext.test(loginEl.loginId.value) && loginEl.loginPw.value.length >= 8)
    await login(state.email, state.password);
  else showErrorBox(loginEl.loginErrorBox);
}

// 로그인 실패 시 Error Box
export function showErrorBox(errorbox) {
  errorbox.classList.add("show");
  setTimeout(() => {
    errorbox.classList.remove("show");
  }, 1500);
}

// 로그인 시 유효성 검사
loginEl.loginId.addEventListener("focusout", () => {
  if (loginEl.loginId.value && !validationEl.exptext.test(loginEl.loginId.value)) {
    validationStyle(validationEl.idErrorMsg, "add", loginEl.idboxEl, "#ed234b");
  }
});
loginEl.loginId.addEventListener("focusin", () => {
  validationStyle(validationEl.idErrorMsg, "remove", loginEl.idboxEl, "#999");
});

// 로컬에 로그인 데이터 있는지 확인.
export async function autoLogin() {
  const token = localStorage.getItem("token");
  if (token) {
    loginModalEl.loginBtnEl.textContent = "로그아웃";
    await authLogin();
  } else {
    loginModalEl.loginBtnEl.textContent = "로그인/가입";
  }
  // 만료시간 체크는 계속
  getItemWithExpireTime("token");
}

// 회원정보 클릭
export async function userinfoClick() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location = "#/user";
  } else {
    alertModal(`로그인을 해주세요.`);
  }
}

// 비밀번호 변경
export async function pwchange(event) {
  event.preventDefault();
  if (!userInfoEl.userInfoPw.value || !userInfoEl.userInfoNewPw.value) {
    alertModal(`비밀번호를 입력해주세요.`);
    return;
  }
  if (userInfoEl.userInfoNewPw.value.length < 8) {
    alertModal(`비밀번호를 8자리 이상 입력해주세요.`);
    return;
  }
  await editUser(
    "비밀번호",
    userInfoEl.userInfoName.value,
    userInfoEl.userInfoPw.value,
    userInfoEl.userInfoNewPw.value
  );
}

// 만료 시간과 함께 데이터를 저장
export function setItemWithExpireTime(keyName, keyValue, tts) {
  const obj = {
    value: keyValue,
    expire: Date.now() + tts,
  };
  const objString = JSON.stringify(obj);
  window.localStorage.setItem(keyName, objString);
}

// 만료 시간을 체크하며 데이터 읽기
export function getItemWithExpireTime(keyName) {
  const objString = window.localStorage.getItem(keyName);
  if (!objString) {
    return null;
  }
  const obj = JSON.parse(objString);
  if (Date.now() > obj.expire) {
    window.localStorage.removeItem(keyName);
    loginModalEl.loginBtnEl.textContent = "로그인/가입";
    return null;
  }
  return obj.value;
}
