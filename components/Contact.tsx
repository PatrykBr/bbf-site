"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";

// PostHog event names
enum ContactEvents {
  CONTACT_METHOD_CLICK = "contact_methods:method_click",
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(60);

  const posthog = usePostHog();

  // Reset cooldown when component mounts/remounts
  useEffect(() => {
    setCooldown(false);
    setCooldownTimeLeft(0);
  }, []);

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (cooldown && cooldownTimeLeft > 0) {
      timer = setTimeout(() => {
        setCooldownTimeLeft((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            setCooldown(false);
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown, cooldownTimeLeft]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cooldown) return; // Prevent submission during cooldown

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.cooldown) {
          // Rate limit exceeded with cooldown info
          setCooldown(true);
          setCooldownTimeLeft(data.cooldownSeconds || 60);
          throw new Error(
            `Rate limit exceeded. Please wait ${
              data.cooldownSeconds || 60
            } seconds before trying again.`
          );
        }
        throw new Error(data.error || "Failed to send message");
      }

      // Reset form and show success message
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSubmitSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (!(error instanceof Error && error.message.includes("Rate limit"))) {
        alert("Failed to send message. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle contact method click
  const handleContactMethodClick = (method: string) => {
    posthog?.capture(ContactEvents.CONTACT_METHOD_CLICK, {
      method: method,
      location: "contact_section",
    });
  };

  return (
    <section
      id="contact"
      className="bg-secondary py-20 relative overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-16 relative z-10">
        <div className="text-center mb-16 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-secondary/30 hidden md:block"></div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-poppins relative inline-block">
            Get In Touch
            <div className="absolute -bottom-3 left-0 w-full h-1 bg-primary"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Contact Info - 2 columns */}
          <div className="lg:col-span-2 flex flex-col space-y-8 order-1 lg:order-1 lg:h-full">
            {/* Contact Methods Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 transform hover:scale-[1.02] transition-transform duration-300 border-l-4 border-secondary relative overflow-hidden">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-primary pb-3 relative">
                Contact Methods
                <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-secondary"></span>
                <span className="absolute bottom-0 left-16 w-full h-0.5 bg-primary/10"></span>
              </h3>

              <div className="space-y-6 sm:space-y-8 relative z-10">
                {/* Phone Contact */}
                <a
                  href="tel:+44 7523 706742"
                  className="block cursor-pointer"
                  onClick={() => handleContactMethodClick("phone")}
                >
                  <div className="flex items-start group hover:bg-secondary/5 p-2 sm:p-3 -m-2 sm:-m-3 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl shadow-sm bg-white group-hover:shadow-md transition-all duration-300">
                      <Image
                        src="/phone.webp"
                        alt="Phone Icon"
                        width={25}
                        height={25}
                        className="object-contain transition-all duration-300 group-hover:brightness-110"
                      />
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <h4 className="text-sm sm:text-base font-medium text-dark-gray group-hover:text-primary transition-colors duration-300">
                          Phone
                        </h4>
                        <span className="text-xs font-medium text-primary border border-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                          Preferred
                        </span>
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-primary group-hover:translate-x-1 inline-block transition-transform duration-300 mt-1">
                        +44 7523 706742
                      </div>
                      <p className="text-xs sm:text-sm text-dark-gray/70 mt-1 group-hover:text-dark-gray/90 transition-colors duration-300">
                        Available Monday-Friday, 9am-6pm
                      </p>
                    </div>
                  </div>
                </a>

                {/* Email Contact */}
                <a
                  href="mailto:broncelfurniture@gmail.com"
                  className="block cursor-pointer"
                  onClick={() => handleContactMethodClick("email")}
                >
                  <div className="flex items-start group hover:bg-secondary/5 p-2 sm:p-3 -m-2 sm:-m-3 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl shadow-sm bg-white group-hover:shadow-md transition-all duration-300">
                      <Image
                        src="/email.webp"
                        alt="Email Icon"
                        width={25}
                        height={25}
                        className="object-contain transition-all duration-300 group-hover:brightness-110"
                      />
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-dark-gray group-hover:text-primary transition-colors duration-300">
                        Email
                      </h4>
                      <div className="text-base sm:text-lg font-semibold text-primary group-hover:translate-x-1 inline-block transition-transform duration-300 mt-1 break-all email-text">
                        broncelfurniture@gmail.com
                      </div>
                      <p className="text-xs sm:text-sm text-dark-gray/70 mt-1 group-hover:text-dark-gray/90 transition-colors duration-300">
                        We respond to emails within 24 hours
                      </p>
                    </div>
                  </div>
                </a>

                {/* Facebook Contact */}
                <a
                  href="https://www.facebook.com/broncelfurniture/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                  onClick={() => handleContactMethodClick("facebook")}
                >
                  <div className="flex items-start group hover:bg-secondary/5 p-2 sm:p-3 -m-2 sm:-m-3 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl shadow-sm bg-white group-hover:shadow-md transition-all duration-300">
                      <Image
                        src="/facebook.webp"
                        alt="Facebook Icon"
                        width={25}
                        height={25}
                        className="object-contain transition-all duration-300 group-hover:brightness-110"
                      />
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-dark-gray group-hover:text-primary transition-colors duration-300">
                        Facebook
                      </h4>
                      <div className="text-base sm:text-lg font-semibold text-primary group-hover:translate-x-1 inline-block transition-transform duration-300 mt-1 truncate facebook-text">
                        Bespoke Broncel Furniture
                      </div>
                      <p className="text-xs sm:text-sm text-dark-gray/70 mt-1 group-hover:text-dark-gray/90 transition-colors duration-300">
                        Follow us for latest updates and inspiration
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Studio Image Section */}
            <div className="relative flex-grow rounded-lg overflow-hidden shadow-xl hidden lg:flex">
              <Image
                src="/workshop.webp"
                alt="Woodworking Workshop"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                <div className="p-8">
                  <h3 className="text-xl text-white font-light tracking-wide mb-2">
                    Bespoke Broncel Furniture
                  </h3>
                  <div className="h-px w-12 bg-secondary mb-4"></div>
                  <p className="text-white/80 text-sm uppercase tracking-wider">
                    South Yorkshire, UK
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - 3 columns */}
          <div className="lg:col-span-3 order-2 lg:order-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 md:p-10 transform hover:scale-[1.01] transition-transform duration-300 border-t-4 border-primary relative overflow-hidden h-full">
              <div className="relative">
                <h3 className="text-2xl font-bold mb-6 text-primary pb-3 inline-block relative">
                  Send Us A Message
                  <span className="absolute bottom-0 left-0 w-20 h-0.5 bg-secondary"></span>
                  <span className="absolute bottom-0 left-20 w-full h-0.5 bg-primary/10"></span>
                </h3>

                <div className="min-h-[420px]">
                  {submitSuccess ? (
                    <div className="bg-secondary/10 border border-secondary text-primary rounded-lg p-8 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto mb-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-2xl font-bold mb-3">Thank You!</h4>
                      <p className="mb-6 text-lg">
                        Your message has been sent successfully. We&apos;ll get
                        back to you soon.
                      </p>
                      <button
                        onClick={() => setSubmitSuccess(false)}
                        className="px-6 py-2 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-medium rounded-md transition-colors duration-300 cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : cooldown ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto mb-4 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-2xl font-bold mb-3">Please Wait</h4>
                      <p className="mb-6 text-lg">
                        You&apos;re submitting messages too quickly.
                        <br />
                        Please wait{" "}
                        <span className="font-semibold">
                          {cooldownTimeLeft} second
                          {cooldownTimeLeft !== 1 ? "s" : ""}
                        </span>{" "}
                        before trying again.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-6 relative z-10"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-dark-gray mb-1"
                          >
                            Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 rounded-md bg-light-gray border ${
                                errors.name
                                  ? "border-red-500"
                                  : "border-gray-200"
                              } focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200`}
                              placeholder="Your Name"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {errors.name && (
                                <span className="text-red-500 text-lg">*</span>
                              )}
                            </div>
                          </div>
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-dark-gray mb-1"
                          >
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 rounded-md bg-light-gray border ${
                                errors.email
                                  ? "border-red-500"
                                  : "border-gray-200"
                              } focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200`}
                              placeholder="Your Email"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              {errors.email && (
                                <span className="text-red-500 text-lg">*</span>
                              )}
                            </div>
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-dark-gray mb-1"
                        >
                          Phone Number{" "}
                          <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-md bg-light-gray border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                          placeholder="Your Phone Number"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-dark-gray mb-1"
                        >
                          Message <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            className={`w-full px-4 py-3 rounded-md bg-light-gray border ${
                              errors.message
                                ? "border-red-500"
                                : "border-gray-200"
                            } focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200`}
                            placeholder="Tell us about your project..."
                          />
                          <div className="absolute bottom-3 right-3 pointer-events-none">
                            {errors.message && (
                              <span className="text-red-500 text-lg">*</span>
                            )}
                          </div>
                        </div>
                        {errors.message && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-4 px-6 font-medium text-white bg-primary rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
                            isSubmitting
                              ? "opacity-70 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <span className="relative flex justify-center items-center">
                            {isSubmitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                Send Message
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 ml-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                  />
                                </svg>
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations and responsive text sizes */}
      <style jsx>{`
        @keyframes expand-line {
          0%,
          100% {
            width: 12px;
          }
          50% {
            width: 100%;
          }
        }

        .animate-expand-line {
          animation: expand-line 5s ease-in-out infinite;
        }

        /* Reduce email text size below 430px */
        @media (max-width: 429px) {
          .email-text {
            font-size: 0.72rem !important; /* 14px */
          }
        }

        /* Reduce Facebook name size below 390px */
        @media (max-width: 389px) {
          .facebook-text {
            font-size: 0.8rem !important; /* 14px */
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
