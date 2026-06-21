import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Terms & Conditions",
  description:
    "Sea Saba terms and conditions, cancellation policy, payment terms, travel insurance, liability waivers, group travel, fitness to dive, and force majeure information.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Terms & Conditions
      </h1>

      <p className="mt-4 text-base font-medium text-foreground">
        Sea Saba Cancellation & Payment Policy
      </p>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Please read the following terms carefully before booking. By confirming a reservation with Sea Saba, you agree to the policies outlined below.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Dive Trips & Multi-Day Packages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>A 25% deposit is required to confirm your booking. The remaining balance is due 14 days prior to your scheduled start date.</li>
            <li>Cancellations made more than 60 days before the start date are refundable, less a 5% processing fee.</li>
            <li>Cancellations made between 30 and 60 days before the start date will result in forfeiture of the deposit.</li>
            <li>Cancellations made within 30 days of the scheduled start date are non-refundable.</li>
            <li>We understand that travel plans can change. While payments may become non-refundable within certain timeframes, we are happy to assist with a one-time reschedule when requested at least 7 days before arrival, subject to availability.</li>
            <li>No-shows and missed departures are non-refundable.</li>
            <li>If Sea Saba cancels an activity due to unsafe weather or sea conditions, guests may choose to reschedule or receive a refund for the affected portion of the booking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Sunset Cruises & Snorkel Trips</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>No deposit is required at the time of booking. Payment will be requested prior to departure once weather conditions are confirmed.</li>
            <li>Cancellations made more than 24 hours before departure are fully refundable.</li>
            <li>Cancellations within 24 hours of departure are non-refundable.</li>
            <li>If Sea Saba cancels due to weather or sea conditions, guests may reschedule or receive a full refund.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Dive Courses</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>A 25% deposit is required to confirm all course reservations. The remaining balance is due 14 days before the course start date.</li>
            <li>Digital eLearning materials are issued upon registration and are non-transferable. Once eLearning access has been assigned, the deposit becomes non-refundable.</li>
            <li>Cancellations made more than 30 days before the course start date are refundable, less the cost of any issued digital materials and a 5% processing fee.</li>
            <li>Cancellations made within 30 days of the start date will result in forfeiture of the deposit.</li>
            <li>Cancellations made within 7 days of the start date are non-refundable.</li>
            <li>When operationally possible, we are happy to assist with rescheduling, subject to instructor availability and training agency requirements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Multi-Day Packages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Multi-day dive discounts apply to consecutive dive days. One non-diving day may be scheduled within a package without affecting the discounted rate. If two or more non-diving days occur between dive days, the package will be considered complete, and additional diving will be priced at the applicable rate.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Travel Insurance</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>We strongly recommend purchasing travel insurance to protect against unforeseen travel disruptions, medical issues, or travel delays. Dive accident insurance and emergency medical evacuation coverage are strongly recommended.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Liability Waivers</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>All participants are required to complete Sea Saba liability waivers and any applicable medical questionnaires prior to participating in diving or related activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Group Travel & Group Contracts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Group bookings are defined as reservations for 8 or more guests, or any reservation receiving contracted group pricing, held inventory, or group-specific discounts.</li>
            <li>Because group travel requires Sea Saba and our hotel partners to reserve accommodations, transportation, staffing, and diving capacity well in advance, group bookings are subject to separate payment, cancellation, and reduction policies.</li>
            <li>An initial non-refundable deposit is required to secure group space and pricing. Additional deposits, finalized rooming lists, and final payment deadlines apply based on the group travel timeline outlined in the group contract.</li>
            <li>Rooms released or reduced after contractual deadlines may be subject to hotel cancellation or attrition penalties.</li>
            <li>Group organizers will receive a detailed written contract outlining all applicable terms, payment schedules, cancellation policies, and operational information prior to confirmation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Fitness to Dive</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>All participants are responsible for ensuring they are medically, physically, and mentally fit to participate in scuba diving and related activities.</li>
            <li>Divers must hold the appropriate certification level for the activities booked and may be required to provide proof of certification and logged dive experience.</li>
            <li>Sea Saba reserves the right to deny participation to any guest who, in the judgment of our staff, may present a safety risk to themselves, other guests, or crew due to medical conditions, lack of experience, unsafe behavior, intoxication, or environmental conditions.</li>
            <li>No refunds will be provided for denied participation related to safety or fitness concerns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Force Majeure</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Sea Saba shall not be held liable for delays, cancellations, itinerary changes, or inability to provide services due to circumstances beyond our reasonable control, including but not limited to severe weather, hurricanes, sea conditions, natural disasters, government actions, airline or ferry disruptions, labor disputes, pandemics, mechanical failures, or other force majeure events.</li>
            <li>Reasonable efforts will be made to reschedule affected services or apply credit where possible; however, refunds beyond amounts recoverable from suppliers or service providers are not guaranteed.</li>
            <li>Sea Saba is not responsible for additional guest expenses including airfare, accommodations, transportation, loss of vacation time, or other consequential costs resulting from travel disruptions or force majeure events.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
