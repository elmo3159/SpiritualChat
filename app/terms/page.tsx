import Link from 'next/link'
import { ArrowLeft, ScrollText } from 'lucide-react'

/**
 * 利用規約ページ
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-dark via-spiritual-darker to-spiritual-dark pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg border-b border-spiritual-lavender/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-spiritual-dark/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <ScrollText className="w-6 h-6 text-spiritual-gold" />
          <h1 className="text-2xl font-bold text-spiritual-gold">利用規約</h1>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 p-6 md:p-8 space-y-8">
          {/* 前文 */}
          <section>
            <p className="text-gray-300 leading-relaxed">
              この利用規約（以下「本規約」といいます）は、スピチャ（以下「当サービス」といいます）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます）には、本規約に従って当サービスをご利用いただきます。
            </p>
            <p className="text-sm text-spiritual-gold mt-4">
              最終更新日：2025年11月8日
            </p>
          </section>

          {/* 第1条 適用 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第1条（適用）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                本規約は、ユーザーと当サービス運営者（以下「当社」といいます）との間の当サービスの利用に関わる一切の関係に適用されるものとします。
              </li>
              <li>
                当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
              </li>
              <li>
                本規約の規定が前条の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。
              </li>
            </ol>
          </section>

          {/* 第2条 サービスの性質と免責事項 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第2条（サービスの性質と免責事項）
            </h2>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-300 font-semibold mb-2">
                ⚠️ 重要な免責事項
              </p>
              <p className="text-sm text-red-200">
                当サービスは占いを目的としたエンターテインメントサービスです。以下の点を十分にご理解の上、ご利用ください。
              </p>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-gray-300 leading-relaxed ml-4">
              <li>
                当サービスで提供される鑑定結果は、AI技術を活用した占いコンテンツであり、参考意見として提供されるものです。
              </li>
              <li>
                鑑定結果は、未来の出来事を保証・約束するものではありません。また、科学的根拠に基づくものではありません。
              </li>
              <li>
                鑑定結果は、医学的診断、法律相談、投資助言、その他の専門的アドバイスを目的としたものではなく、これらに代わるものではありません。
              </li>
              <li>
                ユーザーは、鑑定結果を参考にする場合でも、最終的な判断と行動の責任は自己にあることを理解し、同意するものとします。
              </li>
              <li>
                当社は、鑑定結果の正確性、完全性、有用性、信頼性について、いかなる保証も行いません。
              </li>
              <li>
                当社は、ユーザーが鑑定結果に基づいて行った判断や行動によって生じた、いかなる損害についても責任を負いません。
              </li>
              <li>
                重要な決定を行う際は、必ず専門家（医師、弁護士、税理士等）にご相談ください。
              </li>
            </ol>
          </section>

          {/* 第3条 AI生成コンテンツについて */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第3条（AI生成コンテンツについて）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当サービスの鑑定結果は、Google Gemini APIを使用したAI技術により生成されています。
              </li>
              <li>
                AI生成コンテンツには、以下の制限があることをご理解ください：
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>内容に誤りや不正確な情報が含まれる可能性があります</li>
                  <li>最新の情報を反映していない場合があります</li>
                  <li>文脈の理解に限界があり、不適切な内容が生成される可能性があります</li>
                  <li>同じ質問でも異なる回答が生成される場合があります</li>
                </ul>
              </li>
              <li>
                当社は、AI生成コンテンツの品質向上に努めますが、上記の制限を完全に排除することはできません。
              </li>
            </ol>
          </section>

          {/* 第4条 利用登録 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第4条（利用登録）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
              </li>
              <li>
                当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負いません。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                  <li>本規約に違反したことがある者からの申請である場合</li>
                  <li>未成年者、成年被後見人、被保佐人または被補助人のいずれかであり、法定代理人、後見人、保佐人または補助人の同意等を得ていない場合</li>
                  <li>反社会的勢力等（暴力団、暴力団員、右翼団体、反社会的勢力、その他これに準ずる者を意味します）である、または資金提供その他を通じて反社会的勢力等の維持、運営もしくは経営に協力もしくは関与する等反社会的勢力等との何らかの交流もしくは関与を行っていると当社が判断した場合</li>
                  <li>その他、当社が利用登録を相当でないと判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 第5条 ポイントシステム */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第5条（ポイントシステム）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当サービスでは、サービス内で使用可能なポイント（以下「ポイント」といいます）を提供します。
              </li>
              <li>
                ポイントは1ポイント＝1円相当として、鑑定結果の閲覧等に使用できます。
              </li>
              <li>
                ポイントの購入は、当社が指定する決済方法により行うものとします。
              </li>
              <li>
                購入されたポイントは、購入日から6ヶ月間有効です。有効期限を過ぎたポイントは自動的に失効します。
              </li>
              <li>
                ポイントは、日本円への換金、他のユーザーへの譲渡、相続の対象とすることはできません。
              </li>
              <li>
                消費されたポイントの返還・返金は、当社に責任がある場合を除き、原則として行いません。
              </li>
              <li>
                当社は、ポイントの価値、有効期限、使用条件等を予告なく変更することができます。
              </li>
              <li>
                不正な方法でポイントを取得した場合、当社は当該ポイントを無効とし、アカウントを停止または削除することができます。
              </li>
            </ol>
          </section>

          {/* 第6条 禁止事項 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第6条（禁止事項）
            </h2>
            <p className="text-gray-300 mb-3">
              ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>
                生命・身体に関する相談（自殺、他害等）、医療・診断に関する相談、ギャンブル・投資の予測、試験・選考の合否予測に関する相談
              </li>
              <li>
                当社、当サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
              </li>
              <li>当社のサービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正な目的を持って当サービスを利用する行為</li>
              <li>
                当サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為
              </li>
              <li>他のユーザーに成りすます行為</li>
              <li>
                当社が許諾しない当サービス上での宣伝、広告、勧誘、または営業行為
              </li>
              <li>
                当サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
              </li>
              <li>その他、当社が不適切と判断する行為</li>
            </ol>
          </section>

          {/* 第7条 本サービスの提供の停止等 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第7条（本サービスの提供の停止等）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>
                    本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
                  </li>
                  <li>
                    地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
                  </li>
                  <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                  <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                </ul>
              </li>
              <li>
                当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
              </li>
            </ol>
          </section>

          {/* 第8条 著作権 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第8条（著作権）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当サービス内で提供されるコンテンツ（テキスト、画像、デザイン、プログラム等）に関する知的財産権は、当社または当社にライセンスを許諾している者に帰属します。
              </li>
              <li>
                ユーザーは、当サービスで提供されるコンテンツを、個人的な利用の範囲内でのみ使用することができます。
              </li>
              <li>
                ユーザーは、当社の事前の書面による許可なく、当サービスのコンテンツを複製、転載、配布、公開、改変等することはできません。
              </li>
            </ol>
          </section>

          {/* 第9条 利用制限および登録抹消 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第9条（利用制限および登録抹消）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>本規約のいずれかの条項に違反した場合</li>
                  <li>登録事項に虚偽の事実があることが判明した場合</li>
                  <li>決済手段として当該ユーザーが届け出たクレジットカードが利用停止となった場合</li>
                  <li>料金等の支払債務の不履行があった場合</li>
                  <li>当社からの連絡に対し、一定期間返答がない場合</li>
                  <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
                  <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
                </ul>
              </li>
              <li>
                当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
              </li>
            </ol>
          </section>

          {/* 第10条 退会 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第10条（退会）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                ユーザーは、当社の定める手続により、本サービスから退会することができます。
              </li>
              <li>
                退会により、ユーザーの保有するポイントは失効し、返金されません。
              </li>
              <li>
                退会後も、退会前の利用に関する本規約の適用は継続するものとします。
              </li>
            </ol>
          </section>

          {/* 第11条 保証の否認および免責事項 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第11条（保証の否認および免責事項）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
              </li>
              <li>
                当社は、本サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。ただし、本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
              </li>
              <li>
                前項ただし書に定める場合であっても、当社は、当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（当社またはユーザーが損害発生につき予見し、または予見し得た場合を含みます。）について一切の責任を負いません。また、当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害の賠償は、ユーザーから当該損害が発生した月に受領した利用料の額を上限とします。
              </li>
              <li>
                当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
              </li>
            </ol>
          </section>

          {/* 第12条 サービス内容の変更等 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第12条（サービス内容の変更等）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              当社は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。
            </p>
          </section>

          {/* 第13条 利用規約の変更 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第13条（利用規約の変更）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>本規約の変更がユーザーの一般の利益に適合するとき</li>
                  <li>
                    本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき
                  </li>
                </ul>
              </li>
              <li>
                当社はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。
              </li>
            </ol>
          </section>

          {/* 第14条 個人情報の取扱い */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第14条（個人情報の取扱い）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              当社は、本サービスの利用によって取得する個人情報については、当社「
              <Link
                href="/privacy"
                className="text-spiritual-gold hover:text-spiritual-accent underline"
              >
                プライバシーポリシー
              </Link>
              」に従い適切に取り扱うものとします。
            </p>
          </section>

          {/* 第15条 通知または連絡 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第15条（通知または連絡）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
            </p>
          </section>

          {/* 第16条 権利義務の譲渡の禁止 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第16条（権利義務の譲渡の禁止）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
            </p>
          </section>

          {/* 第17条 準拠法・裁判管轄 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第17条（準拠法・裁判管轄）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>
                本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </li>
            </ol>
          </section>

          {/* お問い合わせ */}
          <section className="pt-4 border-t border-spiritual-lavender/20">
            <h2 className="text-lg font-bold text-spiritual-gold mb-3">
              お問い合わせ
            </h2>
            <p className="text-gray-300">
              本規約に関するお問い合わせは、以下のメールアドレスまでご連絡ください。
            </p>
            <p className="text-spiritual-gold mt-2">
              <a
                href="mailto:support@spichat.jp"
                className="hover:text-spiritual-accent transition-colors"
              >
                support@spichat.jp
              </a>
            </p>
          </section>

          {/* 設定に戻る */}
          <div className="pt-6 text-center">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-spiritual-gold hover:text-spiritual-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              設定に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
