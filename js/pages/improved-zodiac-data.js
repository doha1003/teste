// 개선된 별자리 운세 데이터
// 한국인이 관심있는 키워드 중심의 12별자리 상세 분석

// 12별자리 확장 정보
const expandedZodiacData = {
    aries: {
        symbol: '♈',
        name: '양자리',
        englishName: 'Aries',
        date: '3.21 - 4.19',
        element: '불',
        planet: '화성',
        color: '#FF6B6B',
        lucky: {
            colors: ['빨간색', '주황색', '금색'],
            numbers: [1, 8, 17, 26],
            days: ['화요일'],
            stones: ['다이아몬드', '루비', '가넷']
        },
        personality: {
            strengths: ['리더십', '열정적', '용감함', '솔직함', '적극성', '개척정신'],
            weaknesses: ['성급함', '고집', '이기적', '참을성 부족', '충동적'],
            traits: '천성적인 리더로 새로운 것을 시작하는 것을 좋아합니다. 열정적이고 에너지가 넘치며, 도전을 즐깁니다.',
            koreanTraits: '번개탄처럼 빠른 실행력과 뜨거운 열정을 가진 행동파입니다. 한국 사회에서는 창업가나 스포츠 선수로 성공하는 경우가 많습니다.'
        },
        career: {
            suitable: ['CEO/창업가', '운동선수', '군인/경찰', '영업직', '응급실 의사', '소방관', 'PD/연출가'],
            strengths: '새로운 프로젝트를 시작하는 능력이 뛰어나고, 경쟁 상황에서 최고의 성과를 발휘합니다.',
            advice: '너무 성급하게 결정하지 말고, 팀워크를 중시하는 태도가 필요합니다.'
        },
        love: {
            style: '열정적이고 직진적인 연애를 합니다. 첫눈에 반해 적극적으로 어프로치하는 타입입니다.',
            preference: '자신과 비슷하게 활동적이고 독립적인 상대를 선호합니다.',
            koreanDating: '썸보다는 확실한 고백을 선호하고, 밀당보다는 직진을 좋아합니다. 데이트도 액티비티 중심으로 즐깁니다.',
            compatibility: {
                best: ['사자자리', '사수자리'],
                good: ['쌍둥이자리', '물병자리'],
                challenging: ['게자리', '염소자리']
            }
        },
        health: {
            strengths: '전반적으로 건강하고 회복력이 빠릅니다.',
            weaknesses: '머리, 눈, 근육 관련 문제가 생기기 쉽습니다.',
            advice: '과격한 운동으로 인한 부상 주의, 충분한 휴식 필요',
            koreanHealth: '한국 음식 중에서는 매운 음식을 좋아하지만 위장에 무리가 될 수 있으니 적당히 드세요.'
        },
        money: {
            tendency: '충동적인 소비를 하는 경향이 있지만, 돈 버는 능력도 뛰어납니다.',
            investment: '주식이나 창업 등 적극적인 투자를 선호하지만 위험 관리가 필요합니다.',
            koreanMoney: '한국에서는 부동산보다는 주식이나 코인 같은 변동성 높은 투자를 선호하는 경향이 있습니다.'
        }
    },
    
    taurus: {
        symbol: '♉',
        name: '황소자리',
        englishName: 'Taurus',
        date: '4.20 - 5.20',
        element: '흙',
        planet: '금성',
        color: '#2ECC71',
        lucky: {
            colors: ['초록색', '분홍색', '흰색'],
            numbers: [2, 6, 15, 24],
            days: ['금요일'],
            stones: ['에메랄드', '사파이어', '로즈쿼츠']
        },
        personality: {
            strengths: ['안정성', '인내심', '현실적', '성실함', '예술적 감각', '신뢰성'],
            weaknesses: ['고집', '변화 거부', '물질주의', '게으름', '질투심'],
            traits: '안정을 추구하고 꾸준히 노력하는 성격입니다. 예술적 감각이 뛰어나고 미적 센스가 좋습니다.',
            koreanTraits: '한국의 전통적인 미덕인 성실함과 끈기를 잘 보여주는 별자리입니다. 장인 정신이 뛰어나 전문 분야에서 성공합니다.'
        },
        career: {
            suitable: ['요리사', '디자이너', '은행원', '부동산업', '농업', '미용사', '공예가'],
            strengths: '꾸준함과 완벽주의로 높은 품질의 결과물을 만들어냅니다.',
            advice: '변화를 두려워하지 말고 새로운 기술 습득에도 관심을 가지세요.'
        },
        love: {
            style: '안정적이고 장기적인 관계를 추구합니다. 서두르지 않고 천천히 사랑을 키워나갑니다.',
            preference: '경제적으로 안정되고 가정적인 상대를 선호합니다.',
            koreanDating: '결혼 전제의 진지한 만남을 선호하고, 부모님께 인사드리는 것을 중요하게 생각합니다.',
            compatibility: {
                best: ['처녀자리', '염소자리'],
                good: ['게자리', '물고기자리'],
                challenging: ['사자자리', '물병자리']
            }
        },
        health: {
            strengths: '체력이 좋고 면역력이 강합니다.',
            weaknesses: '목, 갑상선, 목소리 관련 문제가 생기기 쉽습니다.',
            advice: '규칙적인 식사와 적당한 운동으로 건강을 유지하세요.',
            koreanHealth: '한국 전통 음식인 된장, 청국장 등 발효 음식이 건강에 특히 좋습니다.'
        },
        money: {
            tendency: '저축을 잘하고 안전한 투자를 선호합니다.',
            investment: '부동산, 금, 정기예금 등 안정적인 자산에 투자합니다.',
            koreanMoney: '한국에서는 아파트 투자나 전세 등 부동산 관련 투자에서 좋은 성과를 냅니다.'
        }
    },

    gemini: {
        symbol: '♊',
        name: '쌍둥이자리',
        englishName: 'Gemini',
        date: '5.21 - 6.21',
        element: '바람',
        planet: '수성',
        color: '#F1C40F',
        lucky: {
            colors: ['노란색', '하늘색', '은색'],
            numbers: [3, 12, 21, 30],
            days: ['수요일'],
            stones: ['아쿠아마린', '시트린', '진주']
        },
        personality: {
            strengths: ['지적 호기심', '적응력', '소통능력', '다재다능', '유머', '창의성'],
            weaknesses: ['변덕', '집중력 부족', '우유부단', '피상적', '일관성 없음'],
            traits: '호기심이 많고 새로운 정보를 빠르게 습득합니다. 뛰어난 소통 능력으로 사람들과 쉽게 어울립니다.',
            koreanTraits: 'SNS와 인터넷 문화에 빠르게 적응하며, 한국의 빠른 트렌드 변화를 가장 잘 따라잡는 별자리입니다.'
        },
        career: {
            suitable: ['기자', '번역가', '교사', '마케터', '방송인', 'IT 개발자', '여행 가이드'],
            strengths: '다양한 분야에 관심이 많고 새로운 기술 습득이 빠릅니다.',
            advice: '한 분야에 집중하는 전문성 개발이 필요합니다.'
        },
        love: {
            style: '지적인 대화를 통해 사랑을 표현하고, 다양한 사람과 만나기를 좋아합니다.',
            preference: '똑똑하고 유머가 있으며 대화가 통하는 상대를 선호합니다.',
            koreanDating: '카톡이나 SNS로 소통하는 것을 좋아하고, 다양한 데이트 코스를 시도합니다.',
            compatibility: {
                best: ['천칭자리', '물병자리'],
                good: ['양자리', '사자자리'],
                challenging: ['처녀자리', '물고기자리']
            }
        },
        health: {
            strengths: '활동적이고 정신적으로 젊습니다.',
            weaknesses: '신경계, 폐, 손과 팔 관련 문제가 생기기 쉽습니다.',
            advice: '스트레스 관리와 충분한 수면이 중요합니다.',
            koreanHealth: '한국의 바쁜 생활 패턴에 잘 적응하지만 번아웃 주의가 필요합니다.'
        },
        money: {
            tendency: '다양한 수입원을 만들려고 하지만 집중력 부족으로 중도에 포기할 수 있습니다.',
            investment: '새로운 투자 상품에 관심이 많지만 충분한 공부 후 투자해야 합니다.',
            koreanMoney: '한국에서는 IT 관련 주식이나 새로운 핀테크 서비스 투자에 관심이 많습니다.'
        }
    },

    cancer: {
        symbol: '♋',
        name: '게자리',
        englishName: 'Cancer',
        date: '6.22 - 7.22',
        element: '물',
        planet: '달',
        color: '#3498DB',
        lucky: {
            colors: ['흰색', '은색', '연파랑'],
            numbers: [4, 13, 22, 31],
            days: ['월요일'],
            stones: ['문스톤', '진주', '로즈쿼츠']
        },
        personality: {
            strengths: ['공감능력', '가족애', '직감력', '보호본능', '감수성', '충성심'],
            weaknesses: ['감정기복', '과보호', '우울함', '집착', '소극적'],
            traits: '가족과 집을 중요하게 여기며, 타인을 돌보는 것을 좋아합니다. 감수성이 풍부하고 직감이 뛰어납니다.',
            koreanTraits: '한국의 강한 가족 문화와 잘 맞으며, 효도와 가족 화목을 가장 중시합니다. 정(情) 문화의 대표 주자입니다.'
        },
        career: {
            suitable: ['간호사', '교사', '상담사', '요리사', '부동산업', '사회복지사', '보육교사'],
            strengths: '타인을 돌보고 보살피는 능력이 뛰어나며, 안정적인 환경에서 최고의 성과를 발휘합니다.',
            advice: '감정에 휩쓸리지 않고 객관적인 판단력을 기르는 것이 필요합니다.'
        },
        love: {
            style: '깊고 진실한 사랑을 추구하며, 상대방을 보살피고 지켜주려 합니다.',
            preference: '가정적이고 안정적인 상대를 선호하며, 결혼과 출산을 중요하게 생각합니다.',
            koreanDating: '부모님 허락을 중요시하고, 명절에 함께 보내는 것을 당연하게 생각합니다.',
            compatibility: {
                best: ['전갈자리', '물고기자리'],
                good: ['황소자리', '처녀자리'],
                challenging: ['양자리', '천칭자리']
            }
        },
        health: {
            strengths: '강한 회복력과 면역력을 가지고 있습니다.',
            weaknesses: '위장, 유방, 정신건강 관련 문제가 생기기 쉽습니다.',
            advice: '스트레스 관리와 규칙적인 식사가 중요합니다.',
            koreanHealth: '한국 전통 보양식인 삼계탕, 미역국 등이 건강에 특히 좋습니다.'
        },
        money: {
            tendency: '미래를 대비해 꾸준히 저축하며, 가족을 위한 지출을 아끼지 않습니다.',
            investment: '안전한 투자를 선호하며, 부동산이나 보험에 관심이 많습니다.',
            koreanMoney: '한국에서는 자녀 교육비나 부모님 효도비에 많은 투자를 합니다.'
        }
    },

    leo: {
        symbol: '♌',
        name: '사자자리',
        englishName: 'Leo',
        date: '7.23 - 8.22',
        element: '불',
        planet: '태양',
        color: '#E74C3C',
        lucky: {
            colors: ['금색', '주황색', '빨간색'],
            numbers: [5, 14, 23, 32],
            days: ['일요일'],
            stones: ['다이아몬드', '토파즈', '호박']
        },
        personality: {
            strengths: ['자신감', '리더십', '창의성', '관대함', '열정', '카리스마'],
            weaknesses: ['자만심', '고집', '과시욕', '권위적', '질투심'],
            traits: '타고난 리더로 주목받는 것을 좋아하며, 창의적이고 열정적입니다. 관대하고 따뜻한 마음을 가지고 있습니다.',
            koreanTraits: '한국 연예계나 방송계에서 많이 볼 수 있는 스타형 별자리입니다. 화려한 것을 좋아하고 브랜드를 중시합니다.'
        },
        career: {
            suitable: ['배우', '가수', '모델', '디자이너', '광고업', 'CEO', '정치가'],
            strengths: '무대에서 빛나며, 창의적인 아이디어로 사람들을 이끌어갑니다.',
            advice: '다른 사람들의 의견도 존중하고 팀워크를 중시하는 자세가 필요합니다.'
        },
        love: {
            style: '드라마틱하고 로맨틱한 연애를 즐기며, 상대방을 공주/왕자처럼 대합니다.',
            preference: '자신을 인정해주고 칭찬해주는 상대를 선호합니다.',
            koreanDating: '인스타그램에 올릴 만한 예쁜 데이트를 좋아하고, 기념일을 중요하게 생각합니다.',
            compatibility: {
                best: ['양자리', '사수자리'],
                good: ['쌍둥이자리', '천칭자리'],
                challenging: ['황소자리', '전갈자리']
            }
        },
        health: {
            strengths: '활력이 넘치고 회복력이 빠릅니다.',
            weaknesses: '심장, 등, 혈압 관련 문제가 생기기 쉽습니다.',
            advice: '과로를 피하고 정기적인 심혈관 검진을 받으세요.',
            koreanHealth: '한국 음식 중 기름진 음식을 좋아하지만 심혈관 건강을 위해 절제가 필요합니다.'
        },
        money: {
            tendency: '돈을 화려하게 쓰는 것을 좋아하며, 브랜드 제품이나 명품에 투자합니다.',
            investment: '눈에 띄는 투자를 선호하며, 주식보다는 부동산이나 예술품에 관심이 많습니다.',
            koreanMoney: '한국에서는 강남 부동산이나 명품, 고급차에 투자하는 경향이 있습니다.'
        }
    },

    virgo: {
        symbol: '♍',
        name: '처녀자리',
        englishName: 'Virgo',
        date: '8.23 - 9.22',
        element: '흙',
        planet: '수성',
        color: '#27AE60',
        lucky: {
            colors: ['갈색', '베이지', '초록색'],
            numbers: [6, 15, 24, 33],
            days: ['수요일'],
            stones: ['사파이어', '카넬리언', '페리도트']
        },
        personality: {
            strengths: ['완벽주의', '분석력', '성실함', '실용성', '겸손', '섬세함'],
            weaknesses: ['비판적', '걱정많음', '융통성 부족', '소심함', '완벽주의 강박'],
            traits: '세심하고 분석적이며, 모든 일을 완벽하게 처리하려 합니다. 실용적이고 도움이 되는 일을 좋아합니다.',
            koreanTraits: '한국의 교육열과 완벽주의 문화에 잘 맞으며, 공무원이나 전문직에서 많이 성공합니다.'
        },
        career: {
            suitable: ['의사', '회계사', '연구원', '편집자', '비서', '품질관리', '영양사'],
            strengths: '꼼꼼하고 정확한 업무 처리 능력이 뛰어나며, 문제 해결 능력이 탁월합니다.',
            advice: '너무 완벽을 추구하지 말고 적당한 선에서 타협하는 법을 배우세요.'
        },
        love: {
            style: '신중하고 조심스러운 연애를 하며, 상대방의 작은 부분까지 세심하게 챙깁니다.',
            preference: '성실하고 안정적인 상대를 선호하며, 외모보다는 내실을 중시합니다.',
            koreanDating: '상대방의 학력, 직업, 가정환경 등을 꼼꼼히 따져보고 신중하게 연애합니다.',
            compatibility: {
                best: ['황소자리', '염소자리'],
                good: ['게자리', '전갈자리'],
                challenging: ['쌍둥이자리', '사수자리']
            }
        },
        health: {
            strengths: '건강 관리에 관심이 많고 규칙적인 생활을 합니다.',
            weaknesses: '소화기관, 신경계, 스트레스성 질환에 주의해야 합니다.',
            advice: '완벽주의로 인한 스트레스를 줄이고 적절한 휴식을 취하세요.',
            koreanHealth: '한국의 건강식품이나 유기농 음식에 관심이 많고, 정기 검진을 빼먹지 않습니다.'
        },
        money: {
            tendency: '계획적이고 체계적으로 돈을 관리하며, 가계부를 꼼꼼히 작성합니다.',
            investment: '안전하고 확실한 투자를 선호하며, 충분한 정보 수집 후 결정합니다.',
            koreanMoney: '한국에서는 적금이나 펀드 등 안정적인 금융상품을 선호합니다.'
        }
    },

    libra: {
        symbol: '♎',
        name: '천칭자리',
        englishName: 'Libra',
        date: '9.23 - 10.22',
        element: '바람',
        planet: '금성',
        color: '#E91E63',
        lucky: {
            colors: ['분홍색', '연파랑', '라벤더'],
            numbers: [7, 16, 25, 34],
            days: ['금요일'],
            stones: ['오팔', '로즈쿼츠', '라피스라줄리']
        },
        personality: {
            strengths: ['균형감', '공정함', '사교성', '평화주의', '미적감각', '협력적'],
            weaknesses: ['우유부단', '갈등회피', '의존적', '피상적', '완벽주의'],
            traits: '균형과 조화를 중시하며, 뛰어난 미적 감각을 가지고 있습니다. 평화를 사랑하고 갈등을 싫어합니다.',
            koreanTraits: '한국의 중용과 조화를 중시하는 문화와 잘 맞으며, 외교나 중재 능력이 뛰어납니다.'
        },
        career: {
            suitable: ['변호사', '외교관', '디자이너', '상담사', '미용사', 'PR 전문가', '큐레이터'],
            strengths: '갈등을 조정하고 아름다운 것을 만드는 능력이 뛰어납니다.',
            advice: '결정력을 기르고 자신의 의견을 더 적극적으로 표현하세요.'
        },
        love: {
            style: '로맨틱하고 균형잡힌 관계를 추구하며, 상대방과의 조화를 중시합니다.',
            preference: '세련되고 교양있는 상대를 선호하며, 외모도 중요하게 생각합니다.',
            koreanDating: '분위기 있는 레스토랑이나 전시회 데이트를 좋아하고, 커플룩이나 커플템을 즐깁니다.',
            compatibility: {
                best: ['쌍둥이자리', '물병자리'],
                good: ['양자리', '사자자리'],
                challenging: ['게자리', '염소자리']
            }
        },
        health: {
            strengths: '전반적으로 균형잡힌 건강을 유지합니다.',
            weaknesses: '신장, 허리, 피부 관련 문제가 생기기 쉽습니다.',
            advice: '스트레스 관리와 균형잡힌 식단이 중요합니다.',
            koreanHealth: '한국의 한방 치료나 아로마 테라피 등 자연 치유법에 관심이 많습니다.'
        },
        money: {
            tendency: '균형잡힌 소비를 하려 노력하지만 미적인 것에는 돈을 많이 씁니다.',
            investment: '안전하고 미적 가치가 있는 투자를 선호합니다.',
            koreanMoney: '한국에서는 예술품이나 명품, 인테리어에 투자하는 경향이 있습니다.'
        }
    },

    scorpio: {
        symbol: '♏',
        name: '전갈자리',
        englishName: 'Scorpio',
        date: '10.23 - 11.22',
        element: '물',
        planet: '명왕성',
        color: '#8E44AD',
        lucky: {
            colors: ['검은색', '진홍색', '보라색'],
            numbers: [8, 17, 26, 35],
            days: ['화요일'],
            stones: ['토파즈', '가넷', '헤마타이트']
        },
        personality: {
            strengths: ['집중력', '통찰력', '열정', '신비로움', '결단력', '충성심'],
            weaknesses: ['질투심', '복수심', '의심', '비밀주의', '강박적'],
            traits: '강렬하고 신비로우며, 뛰어난 통찰력으로 사물의 본질을 꿰뚫어 봅니다. 모든 일에 열정적으로 몰입합니다.',
            koreanTraits: '한국 드라마의 강렬한 멜로나 복수 스토리를 좋아하며, 깊이 있는 관계를 추구합니다.'
        },
        career: {
            suitable: ['심리학자', '수사관', '의사', '연구원', '투자 전문가', '점술가', '외과의사'],
            strengths: '깊이 있는 분석력과 집중력으로 전문 분야에서 최고가 됩니다.',
            advice: '다른 사람들과의 협업 능력을 기르고 감정 조절을 잘 하세요.'
        },
        love: {
            style: '강렬하고 깊은 사랑을 추구하며, 상대방과 완전히 하나가 되기를 원합니다.',
            preference: '진실하고 깊이 있는 상대를 선호하며, 피상적인 관계를 싫어합니다.',
            koreanDating: '한 사람과 깊고 진지한 관계를 원하며, 바람기나 불륜을 절대 용납하지 않습니다.',
            compatibility: {
                best: ['게자리', '물고기자리'],
                good: ['처녀자리', '염소자리'],
                challenging: ['사자자리', '물병자리']
            }
        },
        health: {
            strengths: '강한 치유력과 회복력을 가지고 있습니다.',
            weaknesses: '생식기, 배설기관, 정신건강 관련 문제가 생기기 쉽습니다.',
            advice: '감정 조절과 스트레스 해소가 건강의 열쇠입니다.',
            koreanHealth: '한국의 찜질방이나 사우나 등 디톡스 문화를 좋아하고 건강에 도움이 됩니다.'
        },
        money: {
            tendency: '돈에 대한 집착이 강하며, 투자나 재테크에 깊이 파고듭니다.',
            investment: '위험을 감수하더라도 큰 수익을 추구하며, 부동산이나 주식에 집중 투자합니다.',
            koreanMoney: '한국에서는 부동산이나 주식의 숨겨진 가치를 찾아내는 능력이 뛰어납니다.'
        }
    },

    sagittarius: {
        symbol: '♐',
        name: '사수자리',
        englishName: 'Sagittarius',
        date: '11.23 - 12.21',
        element: '불',
        planet: '목성',
        color: '#9B59B6',
        lucky: {
            colors: ['보라색', '터키색', '빨간색'],
            numbers: [9, 18, 27, 36],
            days: ['목요일'],
            stones: ['터키석', '사파이어', '토파즈']
        },
        personality: {
            strengths: ['자유로움', '낙관적', '모험심', '철학적', '정직함', '국제적 감각'],
            weaknesses: ['무책임', '성급함', '과장', '약속불이행', '자기중심적'],
            traits: '자유를 사랑하고 새로운 경험을 추구합니다. 낙관적이고 철학적이며, 진리를 탐구하는 것을 좋아합니다.',
            koreanTraits: '한국에서 해외 여행이나 워홀, 유학 등을 가장 많이 가는 별자리입니다. 글로벌한 감각이 뛰어납니다.'
        },
        career: {
            suitable: ['여행가이드', '교수', '출판업', '항공업', '번역가', '철학자', '광고기획자'],
            strengths: '넓은 시야와 국제적 감각으로 새로운 분야를 개척합니다.',
            advice: '계획성과 책임감을 기르고, 한 가지 일에 집중하는 능력을 개발하세요.'
        },
        love: {
            style: '자유롭고 개방적인 연애를 추구하며, 모험과 새로운 경험을 함께 할 상대를 원합니다.',
            preference: '지적이고 유머가 있으며, 자유로운 사고를 가진 상대를 선호합니다.',
            koreanDating: '여행이나 페스티벌 등 새로운 경험을 함께 하는 데이트를 좋아합니다.',
            compatibility: {
                best: ['양자리', '사자자리'],
                good: ['천칭자리', '물병자리'],
                challenging: ['처녀자리', '물고기자리']
            }
        },
        health: {
            strengths: '활동적이고 자연 치유력이 뛰어납니다.',
            weaknesses: '허벅지, 간, 좌골신경 관련 문제가 생기기 쉽습니다.',
            advice: '과도한 활동으로 인한 부상을 주의하고, 규칙적인 생활을 유지하세요.',
            koreanHealth: '한국의 산행이나 트레킹 등 야외 활동을 통해 건강을 유지합니다.'
        },
        money: {
            tendency: '돈을 여행이나 경험에 많이 쓰며, 미래를 위한 저축보다는 현재를 즐깁니다.',
            investment: '해외 투자나 새로운 분야의 투자에 관심이 많습니다.',
            koreanMoney: '한국에서는 해외 펀드나 해외 부동산, 암호화폐 등에 투자하는 경향이 있습니다.'
        }
    },

    capricorn: {
        symbol: '♑',
        name: '염소자리',
        englishName: 'Capricorn',
        date: '12.22 - 1.19',
        element: '흙',
        planet: '토성',
        color: '#34495E',
        lucky: {
            colors: ['검은색', '갈색', '회색'],
            numbers: [10, 19, 28, 37],
            days: ['토요일'],
            stones: ['가넷', '오닉스', '제트']
        },
        personality: {
            strengths: ['책임감', '인내심', '야심', '현실적', '신중함', '리더십'],
            weaknesses: ['보수적', '비관적', '완고함', '감정표현 부족', '냉정함'],
            traits: '목표 지향적이고 책임감이 강하며, 꾸준한 노력으로 성공을 이룹니다. 전통과 질서를 중시합니다.',
            koreanTraits: '한국의 수직적 조직 문화에 잘 적응하며, 대기업이나 공공기관에서 성공하는 경우가 많습니다.'
        },
        career: {
            suitable: ['CEO', '공무원', '은행원', '건축가', '법조인', '회계사', '정치가'],
            strengths: '체계적이고 계획적인 업무 수행 능력이 뛰어나며, 장기적인 목표를 달성하는 데 탁월합니다.',
            advice: '융통성을 기르고, 부하직원들과의 소통을 늘리세요.'
        },
        love: {
            style: '신중하고 진지한 연애를 하며, 결혼을 전제로 한 안정적인 관계를 추구합니다.',
            preference: '사회적 지위가 있고 경제적으로 안정된 상대를 선호합니다.',
            koreanDating: '혼인신고부터 아이 계획까지 체계적으로 계획하며, 양가 부모님의 만남을 중요시합니다.',
            compatibility: {
                best: ['황소자리', '처녀자리'],
                good: ['게자리', '전갈자리'],
                challenging: ['양자리', '천칭자리']
            }
        },
        health: {
            strengths: '꾸준한 건강 관리로 장수하는 경향이 있습니다.',
            weaknesses: '무릎, 관절, 피부, 우울증에 주의해야 합니다.',
            advice: '과로를 피하고 적절한 휴식과 운동으로 건강을 관리하세요.',
            koreanHealth: '한국 전통 한방 치료나 보양식에 관심이 많고 꾸준히 챙깁니다.'
        },
        money: {
            tendency: '장기적인 관점에서 돈을 모으며, 안정적인 투자를 선호합니다.',
            investment: '부동산, 금, 연금 등 안전하고 장기적인 투자를 합니다.',
            koreanMoney: '한국에서는 아파트나 오피스텔 등 부동산 투자에서 큰 성과를 냅니다.'
        }
    },

    aquarius: {
        symbol: '♒',
        name: '물병자리',
        englishName: 'Aquarius',
        date: '1.20 - 2.18',
        element: '바람',
        planet: '천왕성',
        color: '#1ABC9C',
        lucky: {
            colors: ['하늘색', '전기색', '은색'],
            numbers: [11, 20, 29, 38],
            days: ['토요일'],
            stones: ['아쿠아마린', '자수정', '사파이어']
        },
        personality: {
            strengths: ['독창성', '미래지향', '인도주의', '독립성', '지적호기심', '우정'],
            weaknesses: ['괴팔함', '냉정함', '고집', '비현실적', '감정표현 부족'],
            traits: '독창적이고 미래지향적이며, 인류를 위한 큰 그림을 그리는 것을 좋아합니다. 자유롭고 독립적인 성격입니다.',
            koreanTraits: '한국의 IT 기술 발전과 혁신 문화를 이끄는 별자리입니다. 새로운 트렌드를 만들어내는 능력이 뛰어납니다.'
        },
        career: {
            suitable: ['IT 개발자', '발명가', '사회운동가', '과학자', '항공우주업', '미래학자', '스타트업 창업가'],
            strengths: '혁신적인 아이디어와 미래를 내다보는 안목으로 새로운 분야를 개척합니다.',
            advice: '현실성을 고려하고, 팀워크를 중시하는 자세가 필요합니다.'
        },
        love: {
            style: '자유롭고 독립적인 관계를 추구하며, 정신적 교감을 중시합니다.',
            preference: '독특하고 개성있는 상대를 선호하며, 서로의 자유를 존중하는 관계를 원합니다.',
            koreanDating: '온라인에서 만나거나 취미 모임을 통한 만남을 선호하고, 전통적인 데이트보다는 새로운 경험을 추구합니다.',
            compatibility: {
                best: ['쌍둥이자리', '천칭자리'],
                good: ['양자리', '사수자리'],
                challenging: ['황소자리', '전갈자리']
            }
        },
        health: {
            strengths: '미래의 건강 트렌드를 먼저 받아들여 건강을 관리합니다.',
            weaknesses: '혈액순환, 발목, 신경계 관련 문제가 생기기 쉽습니다.',
            advice: '새로운 건강법에만 의존하지 말고 기본적인 건강 관리도 중요합니다.',
            koreanHealth: '한국의 첨단 의료 기술이나 웰니스 트렌드를 빠르게 받아들입니다.'
        },
        money: {
            tendency: '미래 기술이나 혁신적인 분야에 투자하는 것을 좋아합니다.',
            investment: '암호화폐, AI 관련 주식, 친환경 에너지 등 미래 산업에 투자합니다.',
            koreanMoney: '한국에서는 코인이나 IT 기술주, ESG 투자 등에 관심이 많습니다.'
        }
    },

    pisces: {
        symbol: '♓',
        name: '물고기자리',
        englishName: 'Pisces',
        date: '2.19 - 3.20',
        element: '물',
        planet: '해왕성',
        color: '#16A085',
        lucky: {
            colors: ['바다색', '라벤더', '은색'],
            numbers: [12, 21, 30, 39],
            days: ['목요일'],
            stones: ['아쿠아마린', '자수정', '문스톤']
        },
        personality: {
            strengths: ['공감능력', '직감력', '창의성', '동정심', '영성', '예술적 감각'],
            weaknesses: ['우유부단', '현실도피', '과민함', '의존적', '망상'],
            traits: '감수성이 풍부하고 직관력이 뛰어나며, 예술적 재능이 있습니다. 타인의 감정을 잘 이해하고 동정심이 많습니다.',
            koreanTraits: '한국의 감성적이고 정서적인 문화와 잘 맞으며, 예술이나 힐링 분야에서 재능을 발휘합니다.'
        },
        career: {
            suitable: ['예술가', '음악가', '상담사', '의료진', '종교인', '사회복지사', '치료사'],
            strengths: '타인을 치유하고 영감을 주는 능력이 뛰어나며, 창의적인 작업에서 최고의 성과를 냅니다.',
            advice: '현실적인 계획 수립과 실행력을 기르는 것이 중요합니다.'
        },
        love: {
            style: '로맨틱하고 헌신적인 사랑을 추구하며, 상대방과 하나가 되고 싶어합니다.',
            preference: '감성적이고 이해심 많은 상대를 선호하며, 정신적 교감을 중시합니다.',
            koreanDating: '감성적인 K-드라마 같은 로맨스를 꿈꾸며, 기념일이나 특별한 순간을 소중히 여깁니다.',
            compatibility: {
                best: ['게자리', '전갈자리'],
                good: ['황소자리', '염소자리'],
                challenging: ['쌍둥이자리', '사수자리']
            }
        },
        health: {
            strengths: '자연 치유력이 뛰어나고 대체 의학에 관심이 많습니다.',
            weaknesses: '발, 면역계, 정신건강, 중독성 질환에 주의해야 합니다.',
            advice: '현실적인 건강 관리와 함께 정신건강 관리도 중요합니다.',
            koreanHealth: '한국의 힐링 문화나 템플스테이, 명상 등을 통해 건강을 관리합니다.'
        },
        money: {
            tendency: '돈에 대한 관심이 적고 감정적으로 소비하는 경향이 있습니다.',
            investment: '직감적으로 투자하지만 위험 관리가 부족할 수 있습니다.',
            koreanMoney: '한국에서는 예술품이나 영성 관련 분야, 힐링 상품에 투자하는 경향이 있습니다.'
        }
    }
};

// 일일/주간/월간 운세 생성 함수
const generateZodiacFortune = function(zodiacSign, period = 'daily') {
    const zodiac = expandedZodiacData[zodiacSign];
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // 시드 값으로 일관된 운세 생성
    const seed = day + month + year + zodiacSign.length;
    
    const fortuneLevels = ['매우좋음', '좋음', '보통', '주의'];
    const getFortuneLevel = (offset) => {
        const index = Math.abs(seed + offset) % fortuneLevels.length;
        return fortuneLevels[index];
    };
    
    const generateScore = (offset) => {
        return 60 + (Math.abs(seed + offset) % 35); // 60-94 점수
    };
    
    return {
        period: period,
        date: `${year}년 ${month}월 ${day}일`,
        overall: {
            level: getFortuneLevel(1),
            score: generateScore(1),
            message: generateOverallMessage(zodiac, getFortuneLevel(1), period)
        },
        love: {
            level: getFortuneLevel(2),
            score: generateScore(2),
            message: generateLoveMessage(zodiac, getFortuneLevel(2), period)
        },
        career: {
            level: getFortuneLevel(3),
            score: generateScore(3),
            message: generateCareerMessage(zodiac, getFortuneLevel(3), period)
        },
        money: {
            level: getFortuneLevel(4),
            score: generateScore(4),
            message: generateMoneyMessage(zodiac, getFortuneLevel(4), period)
        },
        health: {
            level: getFortuneLevel(5),
            score: generateScore(5),
            message: generateHealthMessage(zodiac, getFortuneLevel(5), period)
        },
        lucky: {
            color: zodiac.lucky.colors[Math.abs(seed) % zodiac.lucky.colors.length],
            number: zodiac.lucky.numbers[Math.abs(seed) % zodiac.lucky.numbers.length],
            direction: getLuckyDirection(seed),
            item: getLuckyItem(zodiacSign, seed)
        },
        advice: generateAdvice(zodiac, seed, period)
    };
};

// 메시지 생성 함수들
const generateOverallMessage = function(zodiac, level, period) {
    const messages = {
        '매우좋음': [
            `${zodiac.element} 원소의 강력한 에너지가 ${zodiac.name}에게 최고의 기운을 선사합니다.`,
            `${zodiac.planet}의 축복을 받아 모든 일이 순조롭게 풀리는 황금 시기입니다.`,
            `타고난 ${zodiac.personality.strengths[0]} 능력이 최고조에 달해 큰 성과를 기대할 수 있습니다.`
        ],
        '좋음': [
            `${zodiac.name}의 천성적인 ${zodiac.personality.strengths[1]}이 빛을 발하는 시기입니다.`,
            `전반적으로 안정적이고 발전적인 에너지가 감돌고 있습니다.`,
            `주변 사람들과의 조화로운 관계 속에서 좋은 기회를 잡을 수 있습니다.`
        ],
        '보통': [
            `${zodiac.name} 특유의 신중함으로 현재 상황을 잘 관찰해야 하는 시기입니다.`,
            `급하게 서두르기보다는 차근차근 준비하는 것이 좋겠습니다.`,
            `평범한 일상 속에서도 작은 행복을 찾을 수 있는 시간입니다.`
        ],
        '주의': [
            `${zodiac.personality.weaknesses[0]} 경향을 조심하고 신중하게 행동해야 합니다.`,
            `어려움이 있더라도 ${zodiac.name}의 ${zodiac.personality.strengths[2]} 덕분에 극복할 수 있습니다.`,
            `위기를 기회로 바꿀 수 있는 ${zodiac.name}의 잠재력을 믿고 인내심을 가지세요.`
        ]
    };
    
    const messageArray = messages[level] || messages['보통'];
    return messageArray[Math.abs(Date.now()) % messageArray.length];
};

// 기타 메시지 생성 함수들도 동일한 패턴으로 구현...
const generateLoveMessage = function(zodiac, level, period) {
    // 연애 메시지 생성 로직
    return `${zodiac.love.style} ${level === '매우좋음' ? '완벽한 연애 타이밍입니다!' : '조심스럽게 접근하세요.'}`;
};

const generateCareerMessage = function(zodiac, level, period) {
    // 직업 메시지 생성 로직  
    return `${zodiac.career.strengths} ${level === '매우좋음' ? '최고의 성과를 낼 것입니다!' : '차근차근 준비하세요.'}`;
};

const generateMoneyMessage = function(zodiac, level, period) {
    // 재물 메시지 생성 로직
    return `${zodiac.money.tendency} ${level === '매우좋음' ? '투자 기회를 놓치지 마세요!' : '신중한 관리가 필요합니다.'}`;
};

const generateHealthMessage = function(zodiac, level, period) {
    // 건강 메시지 생성 로직
    return `${zodiac.health.advice} ${level === '매우좋음' ? '최상의 컨디션입니다!' : '건강관리에 더욱 신경쓰세요.'}`;
};

const getLuckyDirection = function(seed) {
    const directions = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '서남쪽', '동북쪽', '서북쪽'];
    return directions[Math.abs(seed) % directions.length];
};

const getLuckyItem = function(zodiacSign, seed) {
    const items = {
        'fire': ['빨간 장미', '태양 모양 액세서리', '촛불', '빨간 립스틱'],
        'earth': ['화분', '나무 팔찌', '베이지 스카프', '천연 수제비누'],
        'air': ['향수', '깃털 장식', '하늘색 마스크', '바람개비'],
        'water': ['진주 목걸이', '물병', '파란색 우산', '달 모양 반지']
    };
    
    const elementType = expandedZodiacData[zodiacSign].element === '불' ? 'fire' :
                       expandedZodiacData[zodiacSign].element === '흙' ? 'earth' :
                       expandedZodiacData[zodiacSign].element === '바람' ? 'air' : 'water';
    
    const itemArray = items[elementType];
    return itemArray[Math.abs(seed) % itemArray.length];
};

const generateAdvice = function(zodiac, seed, period) {
    const adviceTemplates = [
        `${zodiac.personality.strengths[0]}을 활용하여 새로운 기회를 잡아보세요.`,
        `${zodiac.personality.weaknesses[0]} 경향을 주의하며 균형잡힌 생활을 하세요.`,
        `${zodiac.planet}의 에너지를 받아 ${period === 'daily' ? '오늘' : '이번 주'} 중요한 결정을 내리기 좋습니다.`,
        `${zodiac.element} 원소의 특성을 살려 창의적인 아이디어를 실현해보세요.`
    ];
    
    return adviceTemplates[Math.abs(seed) % adviceTemplates.length];
};

// 내보내기
if (typeof window !== 'undefined') {
    window.expandedZodiacData = expandedZodiacData;
    window.generateZodiacFortune = generateZodiacFortune;
}