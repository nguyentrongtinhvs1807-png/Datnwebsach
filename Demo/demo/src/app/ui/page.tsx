"use client";
import { Signup } from "@/app/actions/auth";
import { useActionState } from "react";

export default function SignupPage() {
  return (
    <div>
      <h1>Đăng ký tài khoản</h1>
      <SignupForm />
    </div>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(Signup, undefined);
  
  return (
    <form action={action}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Name" />
      </div>
      {state?.errors?.name && <p>{state.errors.name}</p>}

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" placeholder="Email" />
      </div>
      {state?.errors?.email && <p>{state.errors.email}</p>}

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      {state?.errors?.password && (
        <div>
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <button disabled={pending} type="submit">
        Sign Up
      </button>
    </form>
  );
}
