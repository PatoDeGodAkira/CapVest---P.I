import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaGraduationCap,
  FaLock,
  FaEnvelope,
  FaUser,
  FaStar
} from "react-icons/fa6";

import styles from "./LoginPage.module.css";
import animations from "./LoginAnimations.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateUsername = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 50);
  };

  const switchMode = (register) => {
    setIsRegister(register);
    setMessage("");
    setError("");
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;

    setRegisterData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao realizar login."
        );
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setMessage("Login realizado com sucesso!");

      console.log("Usuário logado:", data.user);

      navigate("/home");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setError("Preencha todos os campos.");
      return;
    }

    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const username = generateUsername(
        registerData.name
      );

      const response = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerData.name,
            username,
            email: registerData.email,
            password: registerData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao criar conta."
        );
      }

      setMessage("Conta criada com sucesso!");

      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setIsRegister(false);
        setMessage("");
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      <div className={styles.background}>
        <div className={styles.backgroundCircleOne}></div>
        <div className={styles.backgroundCircleTwo}></div>
        <div className={styles.backgroundCircleThree}></div>
      </div>


      <div
        className={`${styles.authContainer} ${
          isRegister ? styles.registerMode : ""
        }`}
      >

        <div className={styles.brandTop}>

          <img
            src="/assets/logo.jpg"
            alt="CapVest"
            onError={(event) => {
              event.target.style.display = "none";
            }}
          />

          <span>CapVest</span>

        </div>


        <section className={styles.visualPanel}>

          <div className={styles.visualImage}></div>

          <div className={styles.visualOverlay}></div>

          <div className={styles.visualDecorationOne}></div>
          <div className={styles.visualDecorationTwo}></div>

          <div className={styles.visualContent}>

            <div className={styles.visualTop}>

              <span className={styles.visualBadge}>
                <FaGraduationCap />
                Plataforma de estudos
              </span>

            </div>


            <div className={styles.visualText}>

              {!isRegister ? (
                <div
                  key="loginVisual"
                  className={animations.textEnter}
                >

                  <span className={styles.smallLabel}>
                    Que bom ter você de volta
                  </span>

                  <h1>
                    Continue sua
                    <strong> jornada.</strong>
                  </h1>

                  <p>
                    Seus estudos, suas metas e sua evolução
                    continuam esperando por você.
                  </p>

                </div>
              ) : (
                <div
                  key="registerVisual"
                  className={animations.textEnter}
                >

                  <span className={styles.smallLabel}>
                    Uma nova jornada começa aqui
                  </span>

                  <h1>
                    Prepare-se para
                    <strong> conquistar.</strong>
                  </h1>

                  <p>
                    Crie sua conta e organize sua preparação
                    para o vestibular em um só lugar.
                  </p>

                </div>
              )}

            </div>


            <div className={styles.visualBottom}>

              <div className={styles.capybaraContainer}>

                <div className={styles.capybaraShadow}></div>

                <img
                  src="/assets/capybara-heto-png.webp"
                  alt="Capivara CapVest"
                  className={styles.capybara}
                  onError={(event) => {
                    event.target.style.display = "none";
                  }}
                />

                <div className={styles.capybaraFallback}>
                  🐹
                </div>

              </div>


              <div className={styles.quote}>

                <FaStar />

                <span>
                  Estude no seu ritmo.
                  <br />
                  Evolua todos os dias.
                </span>

              </div>

            </div>


            <div className={styles.visualSwitch}>

              {!isRegister ? (
                <>
                  <span>
                    Ainda não possui uma conta?
                  </span>

                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                  >
                    Criar conta
                    <FaArrowRight />
                  </button>
                </>
              ) : (
                <>
                  <span>
                    Já possui uma conta?
                  </span>

                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                  >
                    Entrar
                    <FaArrowRight />
                  </button>
                </>
              )}

            </div>

          </div>

        </section>


        <section className={styles.formsArea}>

          <div className={styles.formBackground}></div>


          <div
            className={`${styles.formWrapper} ${
              !isRegister
                ? styles.formActive
                : styles.formHidden
            }`}
          >

            <form
              className={styles.form}
              onSubmit={handleLogin}
            >

              <div className={styles.mobileLogo}>

                <img
                  src="/assets/logo.jpg"
                  alt="CapVest"
                />

                <span>CapVest</span>

              </div>


              <div className={styles.formHeader}>

                <span>
                  Acesso
                </span>

                <h2>
                  Entrar
                </h2>

                <p>
                  Acesse sua conta e continue de onde parou.
                </p>

              </div>


              <div className={styles.fieldGroup}>

                <label>
                  Email
                </label>

                <div className={styles.inputWrapper}>

                  <FaEnvelope />

                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="seuemail@exemplo.com"
                    required
                  />

                </div>

              </div>


              <div className={styles.fieldGroup}>

                <label>
                  Senha
                </label>

                <div className={styles.inputWrapper}>

                  <FaLock />

                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Digite sua senha"
                    required
                  />

                </div>

              </div>


              <div className={styles.optionsRow}>

                <label className={styles.checkbox}>

                  <input
                    type="checkbox"
                  />

                  <span>
                    Lembrar acesso
                  </span>

                </label>

                <button
                  type="button"
                  className={styles.linkButton}
                >
                  Esqueci minha senha
                </button>

              </div>


              {error && !isRegister && (
                <p className={styles.errorMessage}>
                  {error}
                </p>
              )}


              {message && !isRegister && (
                <p className={styles.successMessage}>
                  {message}
                </p>
              )}


              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Entrando..."
                    : "Entrar"}
                </span>

                {!loading && <FaArrowRight />}

              </button>


              <div className={styles.mobileSwitch}>

                <span>
                  Não possui conta?
                </span>

                <button
                  type="button"
                  onClick={() => switchMode(true)}
                >
                  Criar conta
                </button>

              </div>

            </form>

          </div>


          <div
            className={`${styles.formWrapper} ${
              isRegister
                ? styles.formActive
                : styles.formHidden
            }`}
          >

            <form
              className={styles.form}
              onSubmit={handleRegister}
            >

              <div className={styles.mobileLogo}>

                <img
                  src="/assets/logo.jpg"
                  alt="CapVest"
                />

                <span>CapVest</span>

              </div>


              <div className={styles.formHeader}>

                <span>
                  Cadastro
                </span>

                <h2>
                  Criar conta
                </h2>

                <p>
                  Comece sua jornada de estudos com o CapVest.
                </p>

              </div>


              <div className={styles.fieldGroup}>

                <label>
                  Nome completo
                </label>

                <div className={styles.inputWrapper}>

                  <FaUser />

                  <input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    placeholder="Seu nome"
                    required
                  />

                </div>

              </div>


              <div className={styles.fieldGroup}>

                <label>
                  Email
                </label>

                <div className={styles.inputWrapper}>

                  <FaEnvelope />

                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="seuemail@exemplo.com"
                    required
                  />

                </div>

              </div>


              <div className={styles.fieldRow}>

                <div className={styles.fieldGroup}>

                  <label>
                    Senha
                  </label>

                  <div className={styles.inputWrapper}>

                    <FaLock />

                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Crie uma senha"
                      required
                    />

                  </div>

                </div>


                <div className={styles.fieldGroup}>

                  <label>
                    Confirmar
                  </label>

                  <div className={styles.inputWrapper}>

                    <FaLock />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Repita a senha"
                      required
                    />

                  </div>

                </div>

              </div>


              {error && isRegister && (
                <p className={styles.errorMessage}>
                  {error}
                </p>
              )}


              {message && isRegister && (
                <p className={styles.successMessage}>
                  {message}
                </p>
              )}


              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >

                <span>
                  {loading
                    ? "Criando..."
                    : "Criar minha conta"}
                </span>

                {!loading && <FaArrowRight />}

              </button>


              <div className={styles.mobileSwitch}>

                <span>
                  Já possui conta?
                </span>

                <button
                  type="button"
                  onClick={() => switchMode(false)}
                >
                  Entrar
                </button>

              </div>

            </form>

          </div>

        </section>

      </div>

    </div>
  );
}