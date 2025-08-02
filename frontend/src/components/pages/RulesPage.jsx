import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { Shield, AlertTriangle, CheckCircle, Users, Gamepad2, MessageSquare, Ban, Eye, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const RulesPage = () => {
  const [user, setUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const { t, currentLanguage } = useLanguage();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Define rules based on current language
  const getRulesData = () => {
    if (currentLanguage === 'uk') {
      return [
        {
          id: 'communication',
          title: 'Правила спілкування',
          icon: MessageSquare,
          color: 'var(--accent-primary)',
          rules: [
            {
              number: '1',
              title: 'Неприйнятна поведінка',
              description: 'Заборонені всі форми неприйнятної поведінки: образи, приниження, погрози, тролінг, флейм, а також будь-які прояви булінгу.',
              severity: 'critical',
              punishment: 'Мут',
              duration: '4 години'
            },
            {
              number: '2',
              title: 'Спам',
              description: 'Заборонено багаторазове повторення однієї і тієї ж фрази в голосовому або текстовому чаті (спам).',
              severity: 'high',
              punishment: 'Мут',
              duration: '4 години'
            },
            {
              number: '3',
              title: 'Расизм і дискримінація',
              description: 'Заборонені прояви расизму, нацизму, сексизму, підбурювання до міжнаціональної ворожнечі, а також політичні обговорення.',
              severity: 'critical',
              punishment: 'Бан',
              duration: '1 день'
            },
            {
              number: '4',
              title: 'Згадування рідних',
              description: 'Не допускається згадування рідних у будь-якому контексті.',
              severity: 'critical',
              punishment: 'Мут',
              duration: 'Тиждень'
            },
            {
              number: '5',
              title: 'Вікові обмеження для голосового чату',
              description: 'Заборонено використання голосового чату особам молодше 15 років. Виняток: якщо вони поводяться адекватно, не порушують правила, надають ігрову інформацію і не зловживають голосовим чатом.',
              severity: 'high',
              punishment: 'Мут',
              duration: 'Місяць'
            },
            {
              number: '6',
              title: 'SoundPad і зміна голосу',
              description: 'Використання SoundPad і аналогічних програм, а також використання мікрофонів, що видають гучні, фонічні звуки і програм для зміни голосу заборонені.',
              severity: 'medium',
              punishment: 'Мут',
              duration: '4 години'
            },
            {
              number: '7',
              title: 'Випрошування',
              description: 'Заборонено просити що-небудь у інших Гравців або Адміністрації проекту, за винятком, коли йдеться про дроп.',
              severity: 'medium',
              punishment: 'Мут',
              duration: '4 години'
            },
            {
              number: '8',
              title: 'Моніторинг чатів',
              description: 'Заборонено моніторити голосові/текстові чати, а також використовувати сторонні програми для цього.',
              severity: 'critical',
              punishment: 'Бан',
              duration: '1 день'
            }
          ]
        },
        {
          id: 'identity',
          title: 'Ідентичність і представлення',
          icon: Users,
          color: 'var(--accent-blue)',
          rules: [
            {
              number: '9',
              title: 'Видавання себе за адміністратора',
              description: 'Заборонено представляти себе Адміністратором або використовувати чужу особу в ніку, чаті, ярликах зброї і таб-тегах. Не можна використовувати префікси або ніки, що належать Адміністраторам або Керівному складу проекту.',
              severity: 'critical',
              punishment: 'Бан',
              duration: 'Тиждень'
            },
            {
              number: '10',
              title: 'Образливі ніки і аватари',
              description: 'Заборонено встановлювати образливі аватари, ніки, теги кланів і ярлики на зброю.',
              severity: 'high',
              punishment: 'Бан',
              duration: '1 день'
            },
            {
              number: '11',
              title: 'Зловживання командами',
              description: 'Заборонено зловживання командами report, votekick, voteban і votemute з метою прискорити реакцію Адміністрації або привернути увагу без достатніх підстав.',
              severity: 'medium',
              punishment: 'Бан',
              duration: '4 години'
            }
          ]
        },
        {
          id: 'advertising',
          title: 'Реклама і торгівля',
          icon: Ban,
          color: 'var(--accent-purple)',
          rules: [
            {
              number: '12',
              title: 'Реклама і торгівля',
              description: 'Заборонена будь-яка реклама сторонніх ресурсів, стримінгових майданчиків і продажів, обмін, покупка або трейдинг будь-яких речей, надання послуг за реальну валюту. За поширення інформації про інші сервери і ігрові проекти - бан назавжди.',
              severity: 'critical',
              punishment: 'Бан',
              duration: 'Тиждень'
            }
          ]
        },
        {
          id: 'administration',
          title: 'Взаємодія з адміністрацією',
          icon: Shield,
          color: 'var(--accent-orange)',
          rules: [
            {
              number: '13',
              title: 'Покидання сервера після порушення',
              description: 'Після порушення правил заборонено покидати сервер з метою уникнути покарання.',
              severity: 'high',
              punishment: 'Бан',
              duration: 'Тиждень'
            },
            {
              number: '14',
              title: 'Ігнорування адміністратора',
              description: 'Заборонено ігнорувати вимоги Адміністратора.',
              severity: 'high',
              punishment: 'Бан',
              duration: '1 день'
            },
            {
              number: '15',
              title: 'Образа адміністрації',
              description: 'Заборонено ображати Адміністрацію проекту, а також обговорювати, засуджувати або критикувати їх дії.',
              severity: 'medium',
              punishment: 'Мут',
              duration: '4 години'
            },
            {
              number: '16',
              title: 'Критика проекту',
              description: 'Заборонені негативні висловлювання і деструктивна критика на адресу проекту в будь-якій формі.',
              severity: 'medium',
              punishment: 'Бан',
              duration: '4 години'  
            },
            {
              number: '17',
              title: 'Провокації і особисті дані',
              description: 'Заборонено провокувати гравців на дії, що порушують правила проекту, а також обговорювати особисті дані або події, що стосуються реального життя.',
              severity: 'high',
              punishment: 'Бан',
              duration: '1 день'
            },
            {
              number: '18',
              title: 'Розкриття присутності адміністрації',
              description: 'Заборонено розкриття присутності Адміністрації на сервері.',
              severity: 'medium',
              punishment: 'Мут',
              duration: '4 години'
            },
            {
              number: '19',
              title: 'Експлуатація недопрацювань',
              description: 'Заборонена експлуатація недопрацювань у правилах або провокаційна поведінка щодо Адміністрації.',
              severity: 'high',
              punishment: 'Бан',
              duration: '1 день'
            },
            {
              number: '23',
              title: 'Звернення до адміністратора',
              description: 'Заборонено звертатися до Адміністратора без поважної причини, а також створювати перешкоди і відволікати від виконання їх обов\'язків.',
              severity: 'high',
              punishment: 'Бан',
              duration: '1 день'
            }
          ]
        },
        {
          id: 'gameplay',
          title: 'Ігровий процес',
          icon: Gamepad2,
          color: 'var(--success)',
          rules: [
            {
              number: '20',
              title: 'Заборонене ПО',
              description: 'Заборонено використовувати будь-яке ПО, заборонене офіційним розробником Valve.',
              severity: 'critical',
              punishment: 'Бан',
              duration: 'Назавжди'
            },
            {
              number: '21',
              title: 'Баги і глітчі',
              description: 'Забороняється використовувати баги і глітчі.',
              severity: 'high',
              punishment: 'Бан',
              duration: '1 день'
            },
            {
              number: '22',
              title: 'Заважання команді',
              description: 'Заборонено відхилятися від виконання завдань і здійснювати дії, не пов\'язані з цілями гри, а також заважати гравцям своєї команди, включаючи навмисне заважання і перешкоджання, такі як біганина за союзниками і постійне заважання їх діям, стрільба, осліплення і т. д.',
              severity: 'medium',
              punishment: 'Бан',
              duration: '1 година'
            }
          ]
        },
        {
          id: 'additional',
          title: 'Додаткові положення',
          icon: Eye,
          color: 'var(--text-muted)',
          rules: [
            {
              number: '24',
              title: 'Права адміністраторів',
              description: 'Адміністратори мають право застосовувати різні форми покарання відповідно до характеру порушення, включаючи як м\'які, так і більш суворі заходи, якщо це необхідно. У разі необхідності Адміністратор повинен поінформувати Куратора і Модератора про ситуацію.',
              severity: 'info',
              punishment: 'За рішенням',
              duration: 'За ситуацією'
            },
            {
              number: '25',
              title: 'Обхід блокувань',
              description: 'Заборонений обхід будь-яких блокувань за допомогою інших акаунтів Steam.',
              severity: 'critical',
              punishment: 'Бан',
              duration: 'Назавжди'
            },
            {
              number: '26',
              title: 'VAC блокування',
              description: 'Заборонено грати маючи акаунти з блокуванням VAC, тривалістю менше 3 місяців.',
              severity: 'high',
              punishment: 'Бан',
              duration: 'До закінчення терміну'
            },
            {
              number: '27',
              title: 'Після видалення читів',
              description: 'Щоб грати на сервері після видалення читів, необхідно почекати 3 місяці.',
              severity: 'high',
              punishment: 'Бан',
              duration: '3 місяці'
            }
          ]
        }
      ];
    } else {
      // English rules
      return [
        {
          id: 'communication',
          title: 'Communication Rules',
          icon: MessageSquare,
          color: 'var(--accent-primary)',
          rules: [
            {
              number: '1',
              title: 'Unacceptable Behavior',
              description: 'All forms of unacceptable behavior are prohibited: insults, humiliation, threats, trolling, flaming, as well as any manifestations of bullying.',
              severity: 'critical',
              punishment: 'Mute',
              duration: '4 hours'
            },
            {
              number: '2',
              title: 'Spam',
              description: 'Repeated repetition of the same phrase in voice or text chat (spam) is prohibited.',
              severity: 'high',
              punishment: 'Mute',
              duration: '4 hours'
            },
            {
              number: '3',
              title: 'Racism and Discrimination',
              description: 'Manifestations of racism, Nazism, sexism, incitement to ethnic hatred, as well as political discussions are prohibited.',
              severity: 'critical',
              punishment: 'Ban',
              duration: '1 day'
            },
            {
              number: '4',
              title: 'Family Mentions',
              description: 'Mentioning family members in any context is not allowed.',
              severity: 'critical',
              punishment: 'Mute',
              duration: '1 week'
            },
            {
              number: '5',
              title: 'Age Restrictions for Voice Chat',
              description: 'Use of voice chat is prohibited for persons under 15 years of age. Exception: if they behave adequately, do not violate rules, provide game information and do not abuse voice chat.',
              severity: 'high',
              punishment: 'Mute',
              duration: '1 month'
            },
            {
              number: '6',
              title: 'SoundPad and Voice Modification',
              description: 'Use of SoundPad and similar programs, as well as microphones that produce loud, distorted sounds and voice modification programs are prohibited.',
              severity: 'medium',
              punishment: 'Mute',
              duration: '4 hours'
            },
            {
              number: '7',
              title: 'Begging',
              description: 'It is prohibited to ask for anything from other Players or Project Administration, except when it comes to drops.',
              severity: 'medium',
              punishment: 'Mute',
              duration: '4 hours'
            },
            {
              number: '8',
              title: 'Chat Monitoring',
              description: 'It is prohibited to monitor voice/text chats, as well as use third-party programs for this purpose.',
              severity: 'critical',
              punishment: 'Ban',
              duration: '1 day'
            }
          ]
        },
        {
          id: 'identity',
          title: 'Identity and Representation',
          icon: Users,
          color: 'var(--accent-blue)',
          rules: [
            {
              number: '9',
              title: 'Impersonating Administrator',
              description: 'It is prohibited to represent yourself as an Administrator or use someone else\'s identity in nickname, chat, weapon labels and tab-tags. You cannot use prefixes or nicknames belonging to Administrators or Management staff of the project.',
              severity: 'critical',
              punishment: 'Ban',
              duration: '1 week'
            },
            {
              number: '10',
              title: 'Offensive Nicknames and Avatars',
              description: 'It is prohibited to set offensive avatars, nicknames, clan tags and weapon labels.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 day'
            },
            {
              number: '11',
              title: 'Command Abuse',
              description: 'Abuse of report, votekick, voteban and votemute commands to speed up Administration reaction or attract attention without sufficient grounds is prohibited.',
              severity: 'medium',
              punishment: 'Ban',
              duration: '4 hours'
            }
          ]
        },
        {
          id: 'advertising',
          title: 'Advertising and Trading',
          icon: Ban,
          color: 'var(--accent-purple)',
          rules: [
            {
              number: '12',
              title: 'Advertising and Trading',
              description: 'Any advertising of third-party resources, streaming platforms and sales, exchange, purchase or trading of any items, providing services for real currency is prohibited. For distributing information about other servers and gaming projects - permanent ban.',
              severity: 'critical',
              punishment: 'Ban',
              duration: '1 week'
            }
          ]
        },
        {
          id: 'administration',
          title: 'Administration Interaction',
          icon: Shield,
          color: 'var(--accent-orange)',
          rules: [
            {
              number: '13',
              title: 'Leaving Server After Violation',
              description: 'After violating rules, it is prohibited to leave the server to avoid punishment.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 week'
            },
            {
              number: '14',
              title: 'Ignoring Administrator',
              description: 'It is prohibited to ignore Administrator requirements.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 day'
            },
            {
              number: '15',
              title: 'Insulting Administration',
              description: 'It is prohibited to insult Project Administration, as well as discuss, condemn or criticize their actions.',
              severity: 'medium',
              punishment: 'Mute',
              duration: '4 hours'
            },
            {
              number: '16',
              title: 'Project Criticism',
              description: 'Negative statements and destructive criticism towards the project in any form are prohibited.',
              severity: 'medium',
              punishment: 'Ban',
              duration: '4 hours'
            },
            {
              number: '17',
              title: 'Provocations and Personal Data',
              description: 'It is prohibited to provoke players to actions that violate project rules, as well as discuss personal data or events related to real life.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 day'
            },
            {
              number: '18',
              title: 'Disclosure of Administration Presence',
              description: 'Disclosure of Administration presence on the server is prohibited.',
              severity: 'medium',
              punishment: 'Mute',
              duration: '4 hours'
            },
            {
              number: '19',
              title: 'Rule Exploitation',
              description: 'Exploitation of rule flaws or provocative behavior towards Administration is prohibited.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 day'
            },
            {
              number: '23',
              title: 'Contacting Administrator',
              description: 'It is prohibited to contact Administrator without valid reason, as well as create obstacles and distract from performing their duties.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 day'
            }
          ]
        },
        {
          id: 'gameplay',
          title: 'Gameplay',
          icon: Gamepad2,
          color: 'var(--success)',
          rules: [
            {
              number: '20',
              title: 'Prohibited Software',
              description: 'It is prohibited to use any software prohibited by the official Valve developer.',
              severity: 'critical',
              punishment: 'Ban',
              duration: 'Permanent'
            },
            {
              number: '21',
              title: 'Bugs and Glitches',
              description: 'Using bugs and glitches is prohibited.',
              severity: 'high',
              punishment: 'Ban',
              duration: '1 day'
            },
            {
              number: '22',
              title: 'Team Interference',
              description: 'It is prohibited to deviate from completing tasks and perform actions unrelated to game objectives, as well as interfere with your team players, including intentional interference and obstruction, such as running after allies and constantly interfering with their actions, shooting, blinding, etc.',
              severity: 'medium',
              punishment: 'Ban',
              duration: '1 hour'
            }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Provisions',
          icon: Eye,
          color: 'var(--text-muted)',
          rules: [
            {
              number: '24',
              title: 'Administrator Rights',
              description: 'Administrators have the right to apply various forms of punishment in accordance with the nature of the violation, including both mild and more severe measures, if necessary. If necessary, the Administrator must inform the Curator and Moderator about the situation.',
              severity: 'info',
              punishment: 'By decision',
              duration: 'By situation'
            },
            {
              number: '25',
              title: 'Bypass Blocks',
              description: 'Bypassing any blocks using other Steam accounts is prohibited.',
              severity: 'critical',
              punishment: 'Ban',
              duration: 'Permanent'
            },
            {
              number: '26',
              title: 'VAC Blocks',
              description: 'It is prohibited to play with accounts that have VAC blocks less than 3 months old.',
              severity: 'high',
              punishment: 'Ban',
              duration: 'Until expiration'
            },
            {
              number: '27',
              title: 'After Removing Cheats',
              description: 'To play on the server after removing cheats, you need to wait 3 months.',
              severity: 'high',
              punishment: 'Ban',
              duration: '3 months'
            }
          ]
        }
      ];
    }
  };

  const rulesSections = getRulesData();

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

  const getLocalizedText = (key) => {
    const texts = {
      en: {
        title: 'Server Rules',
        description: 'Guidelines and regulations that ensure fair play and respectful behavior for all ProjectTest community members.',
        welcome: 'Welcome to ProjectTest Community',
        welcomeDesc: 'These rules are designed to ensure a fair, safe, and enjoyable gaming environment for everyone. Violation of any of these rules may result in punishments including temporary or permanent bans.',
        fairPlay: 'Fair Play',
        safeEnvironment: 'Safe Environment',
        respectOthers: 'Respect Others',
        rulesTitle: 'Rules & Regulations',
        rulesSubtitle: 'Please read through all sections carefully. Ignorance of the rules is not an excuse for breaking them.',
        helpTitle: 'Questions about rules?',
        helpDesc: 'If you have questions about the rules or need clarification, contact the server administration.',
        contactAdmins: 'Contact Administration',
        viewFaq: 'View FAQ',
        punishment: 'Punishment',
        duration: 'Duration'
      },
      uk: {
        title: 'Правила сервера',
        description: 'Правила та положення, які забезпечують комфортну гру для всіх учасників спільноти ProjectTest',
        welcome: 'Ласкаво просимо до спільноти ProjectTest',
        welcomeDesc: 'Ці правила створені для забезпечення справедливої, безпечної та приємної ігрової середи для всіх. Порушення будь-якого з цих правил може призвести до покарання, включаючи тимчасові або постійні бани.',
        fairPlay: 'Чесна гра',
        safeEnvironment: 'Безпечна середа',
        respectOthers: 'Повага до гравців',
        rulesTitle: 'Свід правил',
        rulesSubtitle: 'Ознайомтеся з усіма розділами правил. Незнання правил не звільняє від відповідальності.',
        helpTitle: 'Питання по правилах?',
        helpDesc: 'Якщо у вас є питання по правилах або потрібні роз\'яснення, зверніться до адміністрації сервера.',
        contactAdmins: 'Зв\'язатися з адміністрацією',
        viewFaq: 'Переглянути FAQ',
        punishment: 'Покарання',
        duration: 'Тривалість'
      }
    };
    
    return texts[currentLanguage]?.[key] || texts.en[key];
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
            <h1 className="hero-title">{getLocalizedText('title')}</h1>
            <p className="hero-description">
              {getLocalizedText('description')}
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
                <h2>{getLocalizedText('welcome')}</h2>
                <p>{getLocalizedText('welcomeDesc')}</p>
                
                <div className="intro-highlights">
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>{getLocalizedText('fairPlay')}</span>
                  </div>
                  <div className="highlight-item">
                    <Shield size={16} />
                    <span>{getLocalizedText('safeEnvironment')}</span>
                  </div>
                  <div className="highlight-item">
                    <Users size={16} />
                    <span>{getLocalizedText('respectOthers')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rules Sections */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>{getLocalizedText('rulesTitle')}</h2>
              <p className="section-subtitle">{getLocalizedText('rulesSubtitle')}</p>
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
                                <span><strong>{getLocalizedText('punishment')}:</strong> {rule.punishment}</span>
                              </div>
                              <div className="duration-info">
                                <Clock size={14} style={{ color: 'var(--warning)' }} />
                                <span><strong>{getLocalizedText('duration')}:</strong> {rule.duration}</span>
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
                <h3>{getLocalizedText('helpTitle')}</h3>
                <p>{getLocalizedText('helpDesc')}</p>
                <div className="info-actions">
                  <button className="btn-primary" onClick={() => window.location.href = '/contact'}>
                    {getLocalizedText('contactAdmins')}
                  </button>
                  <button className="btn-secondary" onClick={() => window.location.href = '/faq'}>
                    {getLocalizedText('viewFaq')}
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