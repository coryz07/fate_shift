import { useState } from 'react';
import { LifePathScreen } from './screens/LifePathScreen';
import { AstroCartographyScreen } from './screens/AstroCartographyScreen';
import { FullBirthInput } from './components/FullBirthInput';

export interface BirthData {
  date: string;
  time?: string;
  place?: string;
  timezone?: string;
}

function App() {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'astrocartography'>('analysis');

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Fate Shift</h1>
        <p className="app-subtitle">Precision Chart Analyzer</p>
      </header>
      <main className="app-main">
        {!birthData ? (
          <div className="birth-input-section">
            <h2>Enter Your Birth Information</h2>
            <p className="instruction-text">
              Provide your birth details for a comprehensive life pattern analysis.
              More precise information yields more accurate insights.
            </p>
            <FullBirthInput onBirthDataSubmit={setBirthData} />
          </div>
        ) : (
          <div>
            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <button
                onClick={() => setActiveTab('analysis')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'analysis' ? '#4b2067' : 'transparent',
                  color: activeTab === 'analysis' ? 'white' : '#4b2067',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0',
                  fontWeight: activeTab === 'analysis' ? 'bold' : 'normal'
                }}
              >
                Life Path Analysis
              </button>
              <button
                onClick={() => setActiveTab('astrocartography')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'astrocartography' ? '#4b2067' : 'transparent',
                  color: activeTab === 'astrocartography' ? 'white' : '#4b2067',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0',
                  fontWeight: activeTab === 'astrocartography' ? 'bold' : 'normal'
                }}
              >
                Astro-Cartography
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'analysis' && (
              <LifePathScreen
                birthData={birthData}
                onReset={() => setBirthData(null)}
                onShowModal={setShowModal}
              />
            )}
            {activeTab === 'astrocartography' && (
              <AstroCartographyScreen
                birthData={birthData}
                onReset={() => setBirthData(null)}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Modal System */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(null)}>×</button>
            <div className="modal-body">
              {showModal === 'astrology' && (
                <div>
                  <h3>Understanding Astrology</h3>
                  <p>Astrology analyzes the positions of celestial bodies at your birth to reveal personality traits, tendencies, and life patterns.</p>
                  <h4>Your Astrological Profile:</h4>
                  <ul>
                    <li>Sun Sign: Core personality and ego expression</li>
                    <li>Moon Sign: Emotional nature and inner self</li>
                    <li>Rising Sign: How others perceive you</li>
                  </ul>
                  <p><strong>Take Action:</strong> Embrace your strengths, work on challenges, and align with cosmic timing for major decisions.</p>
                </div>
              )}
              {showModal === 'numerology' && (
                <div>
                  <h3>Understanding Numerology</h3>
                  <p>Numerology reduces your birth date to core numbers that reveal your life's purpose and journey.</p>
                  <h4>Key Numbers:</h4>
                  <ul>
                    <li>Life Path: Your primary life purpose and direction</li>
                    <li>Expression: Your natural talents and abilities</li>
                    <li>Soul Urge: Your inner desires and motivations</li>
                  </ul>
                  <p><strong>Take Action:</strong> Align your career, relationships, and goals with your core numbers for maximum fulfillment.</p>
                </div>
              )}
              {showModal === 'chinese' && (
                <div>
                  <h3>Understanding Chinese Astrology</h3>
                  <p>Based on a 12-year cycle, Chinese astrology reveals your animal sign's characteristics and compatibility patterns.</p>
                  <h4>Your Animal Sign Traits:</h4>
                  <p>Each animal has unique strengths, weaknesses, and compatible partners for relationships and business.</p>
                  <p><strong>Take Action:</strong> Leverage your animal's strengths, work with compatible signs, and plan important events during favorable years.</p>
                </div>
              )}
              {showModal === 'timeline' && (
                <div>
                  <h3>Life Patterns Timeline</h3>
                  <p>This timeline shows critical periods, opportunities, and challenges based on multiple calculation systems.</p>
                  <h4>How to Use:</h4>
                  <ul>
                    <li>Opportunity Periods: Plan major ventures, relationships, or changes</li>
                    <li>Challenge Periods: Focus on patience, learning, and preparation</li>
                    <li>Transition Points: Natural times for career or life changes</li>
                  </ul>
                  <p><strong>Take Action:</strong> Use favorable periods for launches and risky moves. Use challenging periods for skill-building and reflection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
