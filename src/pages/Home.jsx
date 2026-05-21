import Hero from "../components/sections/Hero";
import Vision from "../components/sections/Vision";
import Philosophy from "../components/sections/Philosophy";
import PoliciesStrip from "../components/sections/PoliciesStrip";
import Pedagogy from "../components/sections/Pedagogy";
import DaySchedule from "../components/sections/DaySchedule";
import WeeklyStructure from "../components/sections/WeeklyStructure";
import AfterschoolClub from "../components/sections/AfterschoolClub";
import ForMothers from "../components/sections/ForMothers";
import SpecialProg from "../components/sections/SpecialProg";
import Enrol from "../components/sections/Enrol";

const Home = () => (
  <div style={{ paddingTop: 0 }}>
    <Hero />
    <Vision />
    <Philosophy />
    <PoliciesStrip />
    <Pedagogy />
    <DaySchedule />
    <WeeklyStructure />
    <AfterschoolClub />
    <ForMothers />
    <SpecialProg />
    <Enrol />
  </div>
);

export default Home;
