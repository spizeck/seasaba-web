"use client";

import { useEffect } from "react";

export function TripAdvisorWidget() {
  useEffect(() => {
    // Load TripAdvisor Traveler's Choice badge script
    const scriptId = "ta-badge-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.jscache.com/wejs?wtype=certificateOfExcellence&uniq=126&locationId=1206831&lang=en_US&year=2025&display_version=2";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center">
      <div id="TA_certificateOfExcellence126" className="TA_certificateOfExcellence">
        <ul id="bsmzqF" className="TA_links abYe3o">
          <li id="TihTcSx3cTd3" className="4UcPYJp6YN">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://static.tacdn.com/img2/travelers_choice/widgets/tchotel_2025_L.png"
                alt="TripAdvisor Traveler's Choice 2025"
                className="widCOEImg"
                id="CDSWIDCOELOGO"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
