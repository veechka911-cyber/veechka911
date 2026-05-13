import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { UploadPage } from './pages/UploadPage';
import { DishTypePage } from './pages/DishTypePage';
import { QuestionsPage } from './pages/QuestionsPage';
import { ResultPage } from './pages/ResultPage';
import { LeadPage } from './pages/LeadPage';
import { OfferPage } from './pages/OfferPage';
import { HistoryPage } from './pages/HistoryPage';
import { PolicyPage } from './pages/PolicyPage';
import { TermsPage } from './pages/TermsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how" element={<HowItWorksPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dish-type" element={<DishTypePage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/lead" element={<LeadPage />} />
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
