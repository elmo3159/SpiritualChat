import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

/**
 * プライバシーポリシーページ
 */
export default function PrivacyPage() {
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
          <Shield className="w-6 h-6 text-spiritual-gold" />
          <h1 className="text-2xl font-bold text-spiritual-gold">
            プライバシーポリシー
          </h1>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 p-6 md:p-8 space-y-8">
          {/* 前文 */}
          <section>
            <p className="text-gray-300 leading-relaxed">
              スピチャ（以下「当サービス」といいます）を運営する当社（以下「当社」といいます）は、ユーザーの個人情報の取扱いについて、個人情報の保護に関する法律（以下「個人情報保護法」といいます）をはじめとする個人情報の保護に関する法令、ガイドライン等を遵守し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定め、適切に取り扱います。
            </p>
            <p className="text-sm text-spiritual-gold mt-4">
              最終更新日：2025年11月8日
            </p>
          </section>

          {/* 第1条 個人情報の定義 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第1条（個人情報の定義）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              本ポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含みます）、または個人識別符号が含まれる情報を指します。
            </p>
          </section>

          {/* 第2条 収集する個人情報 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第2条（収集する個人情報）
            </h2>
            <p className="text-gray-300 mb-3">
              当社は、ユーザーから以下の個人情報を収集します：
            </p>
            <div className="space-y-4">
              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  1. アカウント情報
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>メールアドレス</li>
                  <li>パスワード（暗号化して保存）</li>
                  <li>Googleアカウント情報（Google認証を使用する場合）</li>
                </ul>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  2. プロフィール情報
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>ニックネーム</li>
                  <li>生年月日</li>
                  <li>性別</li>
                  <li>出生時刻（任意）</li>
                  <li>居住都道府県（任意）</li>
                  <li>お悩みのカテゴリ</li>
                  <li>お悩みの内容</li>
                  <li>お相手の情報（任意：名前、性別、生年月日、年齢）</li>
                </ul>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  3. 利用情報
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>チャット履歴（占い師とのやり取り）</li>
                  <li>鑑定結果の閲覧履歴</li>
                  <li>ポイント購入・消費履歴</li>
                  <li>サービスの利用状況</li>
                </ul>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  4. 決済情報
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>
                    クレジットカード情報（Stripe社が管理し、当社は保持しません）
                  </li>
                  <li>購入履歴</li>
                  <li>決済ID</li>
                </ul>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  5. 技術情報
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>IPアドレス</li>
                  <li>ブラウザの種類とバージョン</li>
                  <li>デバイス情報</li>
                  <li>アクセスログ</li>
                  <li>Cookie情報</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 第3条 個人情報の利用目的 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第3条（個人情報の利用目的）
            </h2>
            <p className="text-gray-300 mb-3">
              当社は、収集した個人情報を以下の目的で利用します：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>当サービスの提供、維持、保護および改善のため</li>
              <li>ユーザー認証およびアカウント管理のため</li>
              <li>AI占い師による鑑定サービスの提供のため</li>
              <li>ユーザーの質問や相談への回答のため</li>
              <li>ポイントの管理および決済処理のため</li>
              <li>ユーザーサポートおよびお問い合わせへの対応のため</li>
              <li>サービスの利用状況の分析および改善のため</li>
              <li>新機能、キャンペーン、その他のサービス情報のご案内のため</li>
              <li>利用規約違反や不正利用の検出および防止のため</li>
              <li>法令に基づく対応のため</li>
            </ol>
          </section>

          {/* 第4条 個人情報の第三者提供 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第4条（個人情報の第三者提供）
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-300 leading-relaxed ml-4">
              <li>
                当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません：
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>ユーザーの同意がある場合</li>
                  <li>法令に基づく場合</li>
                  <li>
                    人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
                  </li>
                  <li>
                    公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
                  </li>
                  <li>
                    国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
                  </li>
                </ul>
              </li>
              <li>
                前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします：
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>
                    当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合
                  </li>
                  <li>
                    合併その他の事由による事業の承継に伴って個人情報が提供される場合
                  </li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 第5条 外部サービスの利用 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第5条（外部サービスの利用）
            </h2>
            <p className="text-gray-300 mb-4">
              当サービスは、以下の外部サービスを利用しています。これらのサービスには独自のプライバシーポリシーがあり、ユーザーの情報がこれらのサービスに共有される場合があります：
            </p>
            <div className="space-y-3">
              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  1. Google認証（Google LLC）
                </h3>
                <p className="text-sm text-gray-300">
                  ログイン認証のために使用します。
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  プライバシーポリシー：
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spiritual-gold hover:text-spiritual-accent underline ml-1"
                  >
                    https://policies.google.com/privacy
                  </a>
                </p>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  2. Google Gemini API（Google LLC）
                </h3>
                <p className="text-sm text-gray-300">
                  AI鑑定コンテンツの生成に使用します。ユーザーの相談内容がAPIに送信されますが、Googleによるモデル学習には使用されません。
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  利用規約：
                  <a
                    href="https://ai.google.dev/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spiritual-gold hover:text-spiritual-accent underline ml-1"
                  >
                    https://ai.google.dev/terms
                  </a>
                </p>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  3. Supabase（Supabase Inc.）
                </h3>
                <p className="text-sm text-gray-300">
                  データベースおよび認証基盤として使用します。
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  プライバシーポリシー：
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spiritual-gold hover:text-spiritual-accent underline ml-1"
                  >
                    https://supabase.com/privacy
                  </a>
                </p>
              </div>

              <div className="bg-spiritual-dark/50 rounded-lg p-4">
                <h3 className="font-semibold text-spiritual-accent mb-2">
                  4. Stripe（Stripe, Inc.）
                </h3>
                <p className="text-sm text-gray-300">
                  ポイント購入の決済処理に使用します。クレジットカード情報は当社のサーバーを経由せず、直接Stripeに送信されます。
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  プライバシーポリシー：
                  <a
                    href="https://stripe.com/jp/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spiritual-gold hover:text-spiritual-accent underline ml-1"
                  >
                    https://stripe.com/jp/privacy
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 第6条 個人情報の安全管理 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第6条（個人情報の安全管理）
            </h2>
            <p className="text-gray-300 mb-3">
              当社は、個人情報の紛失、破壊、改ざんおよび漏洩などのリスクに対して、以下の安全管理措置を講じています：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                個人情報へのアクセス制限および権限管理
              </li>
              <li>SSL/TLS暗号化による通信の保護</li>
              <li>パスワードの暗号化保存</li>
              <li>定期的なセキュリティ監査およびシステム更新</li>
              <li>従業員への個人情報保護に関する教育</li>
              <li>不正アクセス検知システムの導入</li>
            </ul>
          </section>

          {/* 第7条 Cookieの使用 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第7条（Cookieの使用）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当サービスは、ユーザーの利便性向上およびサービスの最適化のため、Cookieを使用します。
              </li>
              <li>
                Cookieは、以下の目的で使用されます：
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>ログイン状態の維持</li>
                  <li>ユーザー設定の保存</li>
                  <li>サービスの利用状況の分析</li>
                </ul>
              </li>
              <li>
                ユーザーは、ブラウザの設定によりCookieを無効化することができますが、その場合、当サービスの一部機能が利用できなくなる可能性があります。
              </li>
            </ol>
          </section>

          {/* 第8条 ユーザーの権利 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第8条（ユーザーの権利）
            </h2>
            <p className="text-gray-300 mb-3">
              ユーザーは、当社に対して、個人情報保護法の定めに基づき、以下の権利を行使することができます：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>保有個人データの開示請求</li>
              <li>保有個人データの訂正、追加または削除の請求</li>
              <li>保有個人データの利用停止または消去の請求</li>
              <li>保有個人データの第三者提供の停止の請求</li>
            </ol>
            <p className="text-gray-300 mt-4">
              これらの権利を行使される場合は、本ポリシー末尾記載のお問い合わせ先までご連絡ください。なお、開示請求については、個人情報保護法の定めに基づき、手数料をいただく場合があります。
            </p>
          </section>

          {/* 第9条 個人情報の保存期間 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第9条（個人情報の保存期間）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              当社は、個人情報を、利用目的の達成に必要な期間に限り保存します。ただし、法令により保存期間が定められている場合は、その期間保存します。アカウント削除後は、法令で保存が義務付けられている情報を除き、速やかに個人情報を削除します。
            </p>
          </section>

          {/* 第10条 未成年者の個人情報 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第10条（未成年者の個人情報）
            </h2>
            <p className="text-gray-300 leading-relaxed">
              当サービスは、18歳未満の方の利用を想定しておりません。18歳未満の方が当サービスを利用される場合は、必ず保護者の同意を得た上でご利用ください。
            </p>
          </section>

          {/* 第11条 本ポリシーの変更 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4">
              第11条（本ポリシーの変更）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>
                当社は、法令の変更、当サービスの変更、その他必要が生じた場合、本ポリシーを変更することがあります。
              </li>
              <li>
                本ポリシーを変更する場合は、変更後の本ポリシーの施行日および内容を当サービス上での表示その他の適切な方法により周知し、またはユーザーに通知します。
              </li>
              <li>
                変更後の本ポリシーは、当該施行日から効力を生じるものとします。
              </li>
            </ol>
          </section>

          {/* お問い合わせ */}
          <section className="pt-4 border-t border-spiritual-lavender/20">
            <h2 className="text-lg font-bold text-spiritual-gold mb-3">
              お問い合わせ窓口
            </h2>
            <p className="text-gray-300 mb-3">
              本ポリシーに関するお問い合わせ、開示等の請求は、以下の窓口までご連絡ください。
            </p>
            <div className="bg-spiritual-dark/50 rounded-lg p-4">
              <p className="text-gray-300">
                <span className="font-semibold">サービス名：</span>スピチャ
              </p>
              <p className="text-gray-300 mt-2">
                <span className="font-semibold">お問い合わせ先：</span>
                <a
                  href="mailto:privacy@spichat.jp"
                  className="text-spiritual-gold hover:text-spiritual-accent transition-colors ml-1"
                >
                  privacy@spichat.jp
                </a>
              </p>
              <p className="text-sm text-gray-400 mt-3">
                ※ お問い合わせには、本人確認のため、登録されているメールアドレスからのご連絡をお願いいたします。
              </p>
            </div>
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
