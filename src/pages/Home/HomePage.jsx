import styles from "./HomePage.module.css";

import Sidebar from "../../components/Sidebar/Sidebar";

import TopBar from "../../components/Home/TopBar/TopBar";
import HeroBanner from "../../components/Home/HeroBanner/HeroBanner";
import GoalCard from "../../components/Home/GoalCard/GoalCard";
import ContinueCard from "../../components/Home/TodayFocusCard/TodayFocusCard";
import QuickActions from "../../components/Home/QuickActions/QuickActions";
import StatsGrid from "../../components/Home/StatsGrid/StatsGrid";
import RankingCard from "../../components/Home/RankingCard/RankingCard";

import NewsSection from "../../components/Home/NewsSection/NewsSection";
import StudyCalendar from "../../components/Home/StudyCalendar/StudyCalendar";
import EventsCard from "../../components/Home/EventsCard/EventsCard";
import Footer from "../../components/Home/Footer/Footer";

export default function HomePage() {

    return (

        <div className={styles.layout}>

            <Sidebar />

            <main className={styles.main}>

                <TopBar />

                <HeroBanner />

                <section className={styles.firstRow}>

                    <GoalCard />

                    <ContinueCard />

                </section>

                <QuickActions />

                <section className={styles.secondRow}>

                    <StatsGrid />

                    <RankingCard />

                </section>

                <NewsSection />

                <section className={styles.calendarRow}>

                    <StudyCalendar />

                    <EventsCard />

                </section>

                <Footer />

            </main>

        </div>

    );

}