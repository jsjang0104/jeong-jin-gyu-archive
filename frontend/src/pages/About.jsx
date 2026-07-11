import { useEffect, useState } from 'react';
import PlaceholderImage from '../components/PlaceholderImage.jsx';
import { getArchiveItems } from '../api/archive';

export default function About() {
  const [portrait, setPortrait] = useState(null);

  useEffect(() => {
    let alive = true;
    getArchiveItems({ type: 'PHOTO' })
      .then((items) => { if (alive) setPortrait(items[0] || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section className="section about-page">
      <div className="container about-page__grid">
        <div className="about-page__portrait img-hover-zoom">
          {portrait?.image ? (
            <img src={portrait.image} alt="정진규 시인의 초상" />
          ) : (
            <PlaceholderImage titleHanja="絅山" title="정진규" />
          )}
        </div>

        <div className="about-page__body">
          <span className="eyebrow">Poet</span>
          <h1 className="headline">정진규 <span className="display-hanja">鄭鎭圭</span></h1>
          <p className="lede">1939. 10 경기도 안성 출생 — 2017. 9. 28 별세</p>
          <hr className="rule" />

          <p>
            정진규는 산문시의 개척자로 불리는 시인이다. 1960년 《동아일보》 신춘문예에
            「나팔 서정」이 당선되어 등단하였으며, 이후 반세기 넘게 시단의 중심에서
            독자적인 시 세계를 일구었다.
          </p>
          <p>
            1994년 시집 『몸시(몸詩)』, 1997년 『알시(알詩)』를 잇달아 펴내며
            '몸시'·'알시' 연작이라는, 몸과 언어의 관계를 탐구한 자신만의 독자적 시 양식을
            세웠다는 평가를 받는다. 시 창작과 더불어 붓글씨와 시극 등 폭넓은 예술 활동을
            병행한 것으로도 알려져 있다.
          </p>
          <p>
            1988년부터 2013년까지 25년간 월간 《현대시학》 주간을 맡아 후배 시인들의
            발표 지면을 지켰고, 1998년부터 2000년까지 한국시인협회 제31대 회장을
            역임하였다. 한국시인협회상, 월탄문학상, 현대시학작품상, 공초문학상,
            불교문학상, 이상시문학상, 만해대상, 김삿갓문학상, 혜산 박두진 문학상 등을
            수상하였고, 2006년 보관문화훈장을 받았다.
          </p>
          <p>
            호는 絅山(경산)이다. 2008년 고향인 안성의 생가로 거처를 옮기고 당호를
            석가헌(夕佳軒)이라 하였으며, 2013년에는 생가에 서고 '율려정사'를 개관하였다.
            자료에 따르면 그의 서실은 絅山詩室이라 불렸다고 전해진다.
          </p>
          <p>
            2017년 9월 28일, 경기도 안성에서 별세하였다. 그가 남긴 육필 원고와 시작
            노트, 유품과 문헌은 정민영 교수님의 소장 자료를 바탕으로 이 아카이브에 갈무리되어 있다.
          </p>

          <p className="footnote about-page__note">
            ※ 이 소개글은 데모용 초안입니다. 정확한 사실 확인 후 정민영 교수님의 검수를 거쳐 갱신될
            예정입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
