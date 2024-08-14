"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

const Contact: React.FC = () => {
  const [formStatus, setFormStatus] = useState<string>("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    const lastSubmissionTime = localStorage.getItem("lastSubmissionTime");
    if (lastSubmissionTime) {
      const timeElapsed = Date.now() - parseInt(lastSubmissionTime);
      const cooldownPeriod = 1 * 60 * 1000; // 1 minutes in milliseconds
      if (timeElapsed < cooldownPeriod) {
        setIsSubmitDisabled(true);
        setCountdown(Math.ceil((cooldownPeriod - timeElapsed) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isSubmitDisabled) {
      setIsSubmitDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isSubmitDisabled]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
      message: { value: string };
    };

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_TOKEN;

    if (!accessKey) {
      console.error("Web3Forms access token is not set");
      setFormStatus(
        "Configuration error. Please contact the site administrator."
      );
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: target.name.value,
          email: target.email.value,
          message: target.message.value,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFormStatus("Message sent successfully!");
        localStorage.setItem("lastSubmissionTime", Date.now().toString());
        setIsSubmitDisabled(true);
        setCountdown(1 * 60); // 1 minutes cooldown
      } else {
        console.error("Form submission error:", result);
        setFormStatus("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus("An error occurred. Please try again.");
    }
  }

  return (
    <div
      id="Contact"
      className="bg-bff_light_green flex flex-col items-center justify-center min-h-screen py-12 px-4"
    >
      <h1 className="text-white text-5xl md:text-7xl font-bold mb-12 drop-shadow-md text-center">
        Contact Me
      </h1>
      <div className="flex flex-col w-full max-w-4xl gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Button className="bg-slate-100 hover:bg-gray-100 py-8 px-4 rounded-md w-full md:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-glow-light">
            <Image src="/email.png" alt="mail" width={20} height={20} />
            <Link
              href="mailto:broncelfurniture@gmail.com"
              className="text-gray-500"
            >
              broncelfurniture@gmail.com
            </Link>
          </Button>
          <Button className="bg-slate-100 hover:bg-gray-100 py-8 px-4 rounded-md w-full md:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-glow-light">
            <Image src="/phone.png" alt="phone" width={20} height={20} />
            <Link href="tel:+44 7523 706742" className="text-gray-500">
              +44 7523 706742
            </Link>
          </Button>
          <Button className="bg-slate-100 hover:bg-gray-100 py-8 px-4 rounded-md w-full md:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-glow-light">
            <Image src="/facebook.png" alt="facebook" width={20} height={20} />
            <Link
              href="https://www.facebook.com/broncelfurniture/"
              target="_blank"
              className="text-gray-500"
            >
              Broncel Bespoke Furniture
            </Link>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            name="name"
            required
            placeholder="Your Name"
            className="w-full p-3 rounded-md bg-bff_green text-white placeholder-gray-300"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Your Email"
            className="w-full p-3 rounded-md bg-bff_green text-white placeholder-gray-300"
          />
          <textarea
            name="message"
            required
            rows={4}
            placeholder="Your Message"
            className="w-full p-3 rounded-md bg-bff_green text-white placeholder-gray-300"
          ></textarea>
          <Button
            type="submit"
            className="mt-2 bg-slate-100 text-black hover:bg-gray-100 py-2 px-4 rounded-md self-center transition-all duration-300 hover:shadow-glow-light"
            disabled={isSubmitDisabled}
          >
            {isSubmitDisabled
              ? `Wait ${countdown}s to submit again`
              : "Send Message"}
          </Button>
          {formStatus && (
            <p className="text-white mt-2 text-center">{formStatus}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;
