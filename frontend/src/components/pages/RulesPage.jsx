import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { Shield, AlertTriangle, CheckCircle, Users, Gamepad2, MessageSquare, Ban, Eye, Clock } from 'lucide-react';

const RulesPage = () => {
  const [user, setUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const rulesSections = [
    {
      id: 'communication',
      title: 'Правила общения',
      icon: MessageSquare,
      color: 'var(--accent-primary)',
      rules: [
        {
          number: '1',
          title: 'Неприемлемое поведение',
          description: 'Запрещены все формы неприемлемого поведения: оскорбления, унижение, угрозы, троллинг, флейм, а также любые проявления буллинга.',
          severity: 'critical',
          punishment: 'Мут',
          duration: '4 часа'
        },
        {
          number: '2',
          title: 'Спам',
          description: 'Запрещено многократное повторение одной и той же фразы в голосовом или текстовом чате (спам).',
          severity: 'high',
          punishment: 'Мут',
          duration: '4 часа'
        },
        {
          number: '3',
          title: 'Расизм и дискриминация',
          description: 'Запрещены проявления расизма, нацизма, сексизма, подстрекательство к межнациональной розни, а также политические обсуждения.',
          severity: 'critical',
          punishment: 'Бан',
          duration: '1 день'
        },
        {
          number: '4',
          title: 'Упоминание родных',
          description: 'Не допускается упоминание родных в любом контексте.',
          severity: 'critical',
          punishment: 'Мут',
          duration: 'Неделя'
        },
        {
          number: '5',
          title: 'Возрастные ограничения для голосового чата',
          description: 'Запрещено использование голосового чата лицам младше 15 лет. Исключение: если они ведут себя адекватно, не нарушают правила, предоставляют игровую информацию и не злоупотребляют голосовым чатом.',
          severity: 'high',
          punishment: 'Мут',
          duration: 'Месяц'
        },
        {
          number: '6',
          title: 'SoundPad и изменение голоса',
          description: 'Использование SoundPad и аналогичных программ, а также использование микрофонов, издающих громкие, фонящие звуки и программ для изменения голоса запрещены.',
          severity: 'medium',
          punishment: 'Мут',
          duration: '4 часа'
        },
        {
          number: '7',
          title: 'Попрошайничество',
          description: 'Запрещено просить что-либо у других Игроков или Администрации проекта, за исключением, когда речь идет о дропе.',
          severity: 'medium',
          punishment: 'Мут',
          duration: '4 часа'
        },
        {
          number: '8',
          title: 'Мониторинг чатов',
          description: 'Запрещено мониторить голосовые/текстовые чаты, а также использовать сторонние программы для этого.',
          severity: 'critical',
          punishment: 'Бан',
          duration: '1 день'
        }
      ]
    },
    {
      id: 'identity',
      title: 'Идентичность и представление',
      icon: Users,
      color: 'var(--accent-blue)',
      rules: [
        {
          number: '9',
          title: 'Выдача себя за администратора',
          description: 'Запрещено представлять себя Администратором или использовать чужую личность в нике, чате, ярлыках оружия и таб-тегах. Нельзя использовать префиксы или ники, принадлежащие Администраторам или Руководящему составу проекта.',
          severity: 'critical',
          punishment: 'Бан',
          duration: 'Неделя'
        },
        {
          number: '10',
          title: 'Оскорбительные ники и аватары',
          description: 'Запрещено устанавливать оскорбительные аватары, ники, теги кланов и ярлыки на оружие.',
          severity: 'high',
          punishment: 'Бан',
          duration: '1 день'
        },
        {
          number: '11',
          title: 'Злоупотребление командами',
          description: 'Запрещено злоупотребление командами report, votekick, voteban и votemute с целью ускорить реакцию Администрации или привлечь внимание без достаточных оснований.',
          severity: 'medium',
          punishment: 'Бан',
          duration: '4 часа'
        }
      ]
    },
    {
      id: 'advertising',
      title: 'Реклама и торговля',
      icon: Ban,
      color: 'var(--accent-purple)',
      rules: [
        {
          number: '12',
          title: 'Реклама и торговля',
          description: 'Запрещена любая реклама посторонних ресурсов, стриминговых площадок и продаж, обмен, покупка или трейдинг любых вещей, предоставление услуг за реальную валюту. За распространение информации о других серверах и игровых проектах - бан навсегда.',
          severity: 'critical',
          punishment: 'Бан',
          duration: 'Неделя'
        }
      ]
    },
    {
      id: 'administration',
      title: 'Взаимодействие с администрацией',
      icon: Shield,
      color: 'var(--accent-orange)',
      rules: [
        {
          number: '13',
          title: 'Покидание сервера после нарушения',
          description: 'После нарушения правил запрещено покидать сервер с целью избежания наказания.',
          severity: 'high',
          punishment: 'Бан',
          duration: 'Неделя'
        },
        {
          number: '14',
          title: 'Игнорирование администратора',
          description: 'Запрещено игнорировать требования Администратора.',
          severity: 'high',
          punishment: 'Бан',
          duration: '1 день'
        },
        {
          number: '15',
          title: 'Оскорбление администрации',
          description: 'Запрещено оскорблять Администрацию проекта, а также обсуждать, осуждать или критиковать их действия.',
          severity: 'medium',
          punishment: 'Мут',
          duration: '4 часа'
        },
        {
          number: '16',
          title: 'Критика проекта',
          description: 'Запрещены негативные высказывания и деструктивная критика в адрес проекта в любой форме.',
          severity: 'medium',
          punishment: 'Бан',
          duration: '4 часа'  
        },
        {
          number: '17',
          title: 'Провокации и личные данные',
          description: 'Запрещено провоцировать игроков на действия, нарушающие правила проекта, а также обсуждать личные данные или события, касающиеся реальной жизни.',
          severity: 'high',
          punishment: 'Бан',
          duration: '1 день'
        },
        {
          number: '18',
          title: 'Раскрытие присутствия администрации',
          description: 'Запрещено раскрытие присутствия Администрации на сервере.',
          severity: 'medium',
          punishment: 'Мут',
          duration: '4 часа'
        },
        {
          number: '19',
          title: 'Эксплуатация недоработок',
          description: 'Запрещена эксплуатация недоработок в правилах или провокационное поведение в отношении Администрации.',
          severity: 'high',
          punishment: 'Бан',
          duration: '1 день'
        },
        {
          number: '23',
          title: 'Обращение к администратору',
          description: 'Запрещено обращаться к Администратору без уважительной причины, а также создавать препятствия и отвлекать от выполнения их обязанностей.',
          severity: 'high',
          punishment: 'Бан',
          duration: '1 день'
        }
      ]
    },
    {
      id: 'gameplay',
      title: 'Игровой процесс',
      icon: Gamepad2,
      color: 'var(--success)',
      rules: [
        {
          number: '20',
          title: 'Запрещенное ПО',
          description: 'Запрещено использовать любое ПО, запрещенное официальным разработчиком Valve.',
          severity: 'critical',
          punishment: 'Бан',
          duration: 'Навсегда'
        },
        {
          number: '21',
          title: 'Баги и глитчи',
          description: 'Запрещается использовать баги и глитчи.',
          severity: 'high',
          punishment: 'Бан',
          duration: '1 день'
        },
        {
          number: '22',
          title: 'Мешание команде',
          description: 'Запрещено отклоняться от выполнения заданий и совершать действия, не связанные с целями игры, а также мешать игрокам своей команды, включая намеренное мешание и препятствование, такие как беготня за союзниками и постоянное мешание их действиям, стрельба, ослепление и т. д.',
          severity: 'medium',
          punishment: 'Бан',
          duration: '1 час'
        }
      ]
    },
    {
      id: 'additional',
      title: 'Дополнительные положения',
      icon: Eye,
      color: 'var(--text-muted)',
      rules: [
        {
          number: '24',
          title: 'Права администраторов',
          description: 'Администраторы вправе применять различные формы наказания в соответствии с характером нарушения, включая как мягкие, так и более строгие меры, если это необходимо. В случае необходимости Администратор должен проинформировать Куратора и Модератора о ситуации.',
          severity: 'info',
          punishment: 'По решению',
          duration: 'По ситуации'
        },
        {
          number: '25',
          title: 'Обход блокировок',
          description: 'Запрещен обход любых блокировок с помощью других аккаунтов Steam.',
          severity: 'critical',
          punishment: 'Бан',
          duration: 'Навсегда'
        },
        {
          number: '26',
          title: 'VAC блокировки',
          description: 'Запрещено играть имея аккаунты с блокировкой VAC, длительностью менее 3 месяца.',
          severity: 'high',
          punishment: 'Бан',
          duration: 'До истечения срока'
        },
        {
          number: '27',
          title: 'После удаления читов',
          description: 'Чтобы играть на сервере после удаления читов, необходимо подождать 3 месяца.',
          severity: 'high',
          punishment: 'Бан',
          duration: '3 месяца'
        }
      ]
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'var(--error)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--accent-primary)';
      case 'low': return 'var(--accent-blue)';
      case 'info': return 'var(--text-muted)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={14} />;
      case 'high': return <Ban size={14} />;
      case 'medium': return <Shield size={14} />;
      case 'low': return <CheckCircle size={14} />;
      case 'info': return <Eye size={14} />;
      default: return <Shield size={14} />;
    }
  };

  return (
    <div className="rules-page">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-background">
          <div className="cyber-grid"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <Shield size={48} className="hero-icon" />
            <h1 className="hero-title">Правила сервера</h1>
            <p className="hero-description">
              Правила и положения, которые обеспечивают комфортную игру для всех участников сообщества ProjectTest
            </p>
          </div>
        </div>
      </section>

      {/* Page Content */}
      <main className="page-content">
        <div className="content-container">
          
          {/* Introduction */}
          <div className="sequential-section">
            <div className="rules-introduction">
              <div className="intro-card">
                <h2>Добро пожаловать в сообщество ProjectTest</h2>
                <p>Эти правила созданы для обеспечения справедливой, безопасной и приятной игровой среды для всех. Нарушение любого из этих правил может привести к наказанию, включая временные или постоянные баны.</p>
                
                <div className="intro-highlights">
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>Честная игра</span>
                  </div>
                  <div className="highlight-item">
                    <Shield size={16} />
                    <span>Безопасная среда</span>
                  </div>
                  <div className="highlight-item">
                    <Users size={16} />
                    <span>Уважение к игрокам</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rules Sections */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>Свод правил</h2>
              <p className="section-subtitle">Ознакомьтесь со всеми разделами правил. Незнание правил не освобождает от ответственности.</p>
            </div>
            
            <div className="rules-sections">
              {rulesSections.map((section) => {
                const IconComponent = section.icon;
                const isExpanded = expandedSection === section.id;
                
                return (
                  <div key={section.id} className="rules-section">
                    <div 
                      className="section-header"
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    >
                      <div className="section-title">
                        <IconComponent 
                          size={20} 
                          style={{ color: section.color }}
                        />
                        <h3>{section.title}</h3>
                        <span className="rule-count">{section.rules.length}</span>
                      </div>
                      <div className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                        <AlertTriangle size={16} />
                      </div>
                    </div>

                    <div className={`section-content ${isExpanded ? 'expanded' : ''}`}>
                      {section.rules.map((rule) => (
                        <div key={rule.number} className="rule-item">
                          <div className="rule-header">
                            <div className="rule-number">{rule.number}</div>
                            <div className="rule-title-section">
                              <h4 className="rule-title">{rule.title}</h4>
                              <div 
                                className="rule-severity"
                                style={{ color: getSeverityColor(rule.severity) }}
                              >
                                {getSeverityIcon(rule.severity)}
                                <span>{rule.severity}</span>
                              </div>
                            </div>
                          </div>
                          <p className="rule-description">{rule.description}</p>
                          {rule.punishment && (
                            <div className="rule-punishment">
                              <div className="punishment-info">
                                <Ban size={14} style={{ color: 'var(--error)' }} />
                                <span><strong>Наказание:</strong> {rule.punishment}</span>
                              </div>
                              <div className="duration-info">
                                <Clock size={14} style={{ color: 'var(--warning)' }} />
                                <span><strong>Длительность:</strong> {rule.duration}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Info Section */}
          <div className="sequential-section">
            <div className="rules-footer-info">
              <div className="info-card">
                <h3>Вопросы по правилам?</h3>
                <p>Если у вас есть вопросы по правилам или нужны разъяснения, обратитесь к администрации сервера.</p>
                <div className="info-actions">
                  <button className="btn-primary" onClick={() => window.location.href = '/contact'}>
                    Связаться с администрацией
                  </button>
                  <button className="btn-secondary" onClick={() => window.location.href = '/faq'}>
                    Просмотреть FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RulesPage;