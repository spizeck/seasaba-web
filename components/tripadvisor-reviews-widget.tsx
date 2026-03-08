"use client";

import { useEffect } from "react";

/**
 * TripAdvisor live reviews widget
 * Shows 4 recent reviews with write review link
 */
export function TripAdvisorReviewsWidget() {
  useEffect(() => {
    // Load TripAdvisor reviews widget script
    const scriptId = "ta-reviews-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=491&locationId=1206831&lang=en_US&rating=true&nreviews=4&writereviewlink=true&popIdx=true&iswide=true&border=true&display_version=2";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full">
      <div id="TA_selfserveprop491" className="TA_selfserveprop">
        <ul id="oJ75AYg" className="TA_links 91ZhRaGm52Pi">
          <li id="MnOwL7tJ9Q5N" className="CP1xZL5zFXd">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg"
                alt="TripAdvisor"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
