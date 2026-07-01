import { createMetadata } from "@/lib/metadata";
import { InsuranceCTAs } from "@/components/insurance-ctas";

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
        Sea Saba Terms & Conditions
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Please read these Terms & Conditions carefully before booking. By confirming a reservation with Sea Saba, you acknowledge that you have read, understood, and agree to the policies outlined below. These Terms & Conditions govern all diving, snorkeling, sunset cruises, training courses, and other activities operated by Sea Saba unless otherwise stated in a written agreement.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Dive Trips & Multi-Day Packages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>A 25% deposit is required to confirm your booking. The remaining balance is due 14 days prior to your scheduled start date.</li>
            <li>Cancellations made more than 60 days prior to the start date are fully refundable, less a 5% administrative fee to cover payment processing and booking costs.</li>
            <li>Cancellations made between 30 and 60 days before the scheduled start date will result in forfeiture of the deposit.</li>
            <li>Cancellations made within 30 days of the scheduled start date are non-refundable.</li>
            <li>We understand that travel plans can change. While payments may become non-refundable within certain timeframes, we are happy to assist with a one-time reschedule when requested at least 7 days prior to arrival, subject to availability.</li>
            <li>No-shows and missed departures are non-refundable.</li>
            <li>If Sea Saba cancels an activity due to unsafe weather, sea conditions, or other operational safety considerations, guests may choose to reschedule or receive a refund for the affected portion of the booking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Shared Sunset Cruises</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Reservations may be made without payment to reserve a provisional space on the cruise. Once Sea Saba confirms that the minimum number of participants has been reached, guests will be notified once the departure is confirmed.</li>
            <li>Sea Saba requires a minimum of eight (8) paying guests for a shared sunset cruise to operate.</li>
            <li>Once the departure has been confirmed, full payment must be received within 48 hours of notification, or no later than 24 hours prior to departure, whichever occurs first. Reservations that remain unpaid after this deadline may be cancelled by Sea Saba and released to other guests. A reservation is not considered confirmed until full payment has been received.</li>
            <li>If the minimum number of participants is not met, Sea Saba reserves the right to cancel the departure. Guests may transfer their reservation to another available departure date or allow the reservation to be cancelled without penalty.</li>
            <li>Once payment has been received, cancellations made more than 24 hours prior to departure are eligible for a refund, less a 5% administrative fee to cover payment processing and booking costs.</li>
            <li>Cancellations made within 24 hours of departure, no-shows, and missed departures are non-refundable.</li>
            <li>If Sea Saba cancels due to unsafe weather, sea conditions, or other operational safety considerations, guests may reschedule or receive a full refund.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Private Sunset Cruises</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>A 25% deposit is required to confirm your reservation. The remaining balance is due 14 days prior to departure.</li>
            <li>Cancellations made more than 30 days before departure are refundable, less a 5% administrative fee to cover payment processing and booking costs.</li>
            <li>Cancellations made between 7 and 30 days before departure will result in forfeiture of the deposit.</li>
            <li>Cancellations made within 7 days of departure, no-shows, and missed departures are non-refundable.</li>
            <li>If Sea Saba cancels due to unsafe weather, sea conditions, or other operational safety considerations, guests may reschedule or receive a refund for any amounts paid.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Snorkel Trips</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Snorkel trips do not require payment at the time of booking. Payment will be requested once the trip has been confirmed and weather conditions are suitable. Once payment has been received, cancellations made more than 24 hours prior to departure are refundable, less a 5% administrative fee to cover payment processing and booking costs.</li>
            <li>Cancellations made within 24 hours of departure, no-shows, and missed departures are non-refundable.</li>
            <li>If Sea Saba cancels due to unsafe weather, sea conditions, or other operational safety considerations, guests may reschedule or receive a full refund.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Dive Courses</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>A 25% deposit is required to confirm all course reservations. The remaining balance is due 14 days before the course start date.</li>
            <li>Digital eLearning materials are issued upon registration and are non-transferable. Once eLearning access has been assigned, the deposit becomes non-refundable.</li>
            <li>Cancellations made more than 30 days before the course start date are refundable, less the cost of any issued digital materials and a 5% administrative fee to cover payment processing and booking costs.</li>
            <li>Cancellations made within 30 days of the course start date will result in forfeiture of the deposit.</li>
            <li>Cancellations made within 7 days of the course start date are non-refundable.</li>
            <li>When operationally possible, we are happy to assist with rescheduling, subject to instructor availability and training agency requirements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Multi-Day Packages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Multi-day dive discounts apply to consecutive dive days.</li>
            <li>One non-diving day may be scheduled within a package without affecting the discounted rate.</li>
            <li>If two or more non-diving days occur between dive days, the package will be considered complete, and any additional diving will be charged at the applicable daily rate.</li>
            <li>Sea Saba reserves the right to approve reasonable exceptions due to unsafe weather, medical circumstances, or other situations beyond the guest&apos;s control.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Group Travel & Group Contracts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Group bookings are defined as reservations for eight (8) or more guests, or any reservation receiving contracted group pricing, held inventory, or group-specific discounts.</li>
            <li>Because group travel requires Sea Saba and our hotel partners to reserve accommodations, transportation, staffing, and diving capacity well in advance, group bookings are subject to separate payment schedules, cancellation terms, and reduction policies.</li>
            <li>An initial non-refundable deposit is required to secure group space and pricing. Additional deposits, finalized rooming lists, and final payment deadlines are outlined in the applicable group contract.</li>
            <li>Rooms released or reduced after contractual deadlines may be subject to hotel cancellation or attrition penalties.</li>
            <li>Hotel-specific cancellation policies may also apply and will be incorporated into the group contract where applicable.</li>
            <li>Group organizers will receive a written agreement outlining all applicable payment schedules, cancellation policies, operational procedures, and responsibilities prior to confirmation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Travel Insurance</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>We strongly recommend purchasing comprehensive travel insurance to protect against unforeseen travel disruptions, cancellations, medical expenses, and travel delays. Information on optional DiveAssure Travel Insurance is available below.</li>
            <li>Divers are also strongly encouraged to carry dive accident insurance and emergency medical evacuation coverage. Information on optional DAN Short-Term Dive Accident Insurance is available below.</li>
          </ul>
          <div className="mt-4">
            <InsuranceCTAs />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Liability Waivers</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>All participants must complete Sea Saba liability waivers and any applicable medical questionnaires prior to participating in diving or related activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Fitness to Dive</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>All participants are responsible for ensuring they are medically, physically, and mentally fit to participate in scuba diving and related activities.</li>
            <li>Divers must hold the appropriate certification level for the activities booked and may be required to provide proof of certification and logged dive experience.</li>
            <li>Sea Saba reserves the right to deny participation to any guest who, in the judgment of our staff, presents a safety risk to themselves, other guests, or crew due to medical conditions, lack of experience, unsafe behavior, intoxication, or environmental conditions.</li>
            <li>No refunds or credits will be issued for denied participation resulting from safety, medical, certification, fitness, or behavioral concerns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Schedule Changes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Sea Saba reserves the right to substitute vessels, captains, instructors, divemasters, dive sites, itineraries, departure times, or trip durations whenever necessary due to weather, sea conditions, operational requirements, equipment availability, guest safety, or other circumstances beyond our reasonable control.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Late Arrivals</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Guests are responsible for arriving at the designated meeting location by the published check-in time.</li>
            <li>Sea Saba is not responsible for missed departures resulting from late arrival. Missed departures are considered no-shows and are non-refundable unless otherwise stated in these Terms & Conditions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Captain&apos;s Authority</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>The captain has final authority regarding the safe operation of the vessel.</li>
            <li>Routes, destinations, dive sites, activities, departure times, and trip durations may be modified, postponed, shortened, or cancelled whenever deemed necessary for the safety of guests, crew, or the vessel.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Refunds</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Approved refunds will be issued to the original payment method whenever possible.</li>
            <li>The 5% administrative fee, where applicable, is non-refundable and covers payment processing, booking administration, and associated transaction costs.</li>
            <li>Refund processing times vary by financial institution and payment provider and may take 5–10 business days to appear.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Force Majeure</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Sea Saba shall not be held liable for delays, cancellations, itinerary changes, or the inability to provide services due to circumstances beyond our reasonable control, including but not limited to severe weather, hurricanes, sea conditions, natural disasters, port or harbor closures, government actions or restrictions, airline or ferry disruptions, labor disputes, pandemics, vessel or equipment failures, or other force majeure events.</li>
            <li>Reasonable efforts will be made to reschedule affected services or apply credit where appropriate. However, refunds or compensation beyond amounts recoverable from suppliers or service providers cannot be guaranteed.</li>
            <li>Sea Saba is not responsible for additional guest expenses including airfare, accommodations, transportation, meals, loss of vacation time, or other consequential costs resulting from travel disruptions or force majeure events.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Photography & Marketing</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Sea Saba may photograph or record activities for promotional purposes. Guests who prefer not to appear in photographs or videos should notify our staff before departure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Personal Property</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Sea Saba is not responsible for loss of or damage to personal property, including cameras, dive equipment, luggage, clothing, or other personal belongings, whether onboard our vessels, in our facilities, or during transportation.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
