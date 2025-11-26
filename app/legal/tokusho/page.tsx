import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'

/**
 * 特定商取引法に基づく表記ページ
 */
export default function TokushoPage() {
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
          <Scale className="w-6 h-6 text-spiritual-gold" />
          <h1 className="text-2xl font-bold text-spiritual-gold">
            特定商取引法に基づく表記
          </h1>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 p-6 md:p-8 space-y-8">
          {/* 前文 */}
          <section>
            <p className="text-gray-300 leading-relaxed">
              「スピチャ」（以下「当サービス」といいます）における有料サービスの販売条件等を、特定商取引法に基づき以下の通り表示いたします。
            </p>
            <p className="text-sm text-spiritual-gold mt-4">
              最終更新日：2025年11月11日
            </p>
          </section>

          {/* 販売業者について */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              販売業者について
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">事業者名</dt>
                <dd className="text-gray-300">
                  請求があれば遅滞なく開示いたします
                </dd>
              </div>
            </div>
          </section>

          {/* 運営責任者 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              運営責任者
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">代表者氏名</dt>
                <dd className="text-gray-300">
                  請求があれば遅滞なく開示いたします
                </dd>
              </div>
            </div>
          </section>

          {/* 所在地 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              所在地
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">所在地</dt>
                <dd className="text-gray-300">
                  請求があれば遅滞なく開示いたします
                </dd>
              </div>
            </div>
          </section>

          {/* 連絡先 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              連絡先
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">電話番号</dt>
                <dd className="text-gray-300">
                  請求があれば遅滞なく開示いたします
                </dd>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">
                  メールアドレス
                </dt>
                <dd className="text-gray-300">
                  <a
                    href="mailto:sanri3159211@gmail.com"
                    className="text-spiritual-gold hover:text-spiritual-accent transition-colors underline"
                  >
                    sanri3159211@gmail.com
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">
                  営業時間
                </dt>
                <dd className="text-gray-300">24時間365日（自動応答システム）</dd>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                <dt className="text-spiritual-accent font-medium">
                  お問い合わせ対応時間
                </dt>
                <dd className="text-gray-300">
                  メールでのお問い合わせは24時間受付、原則として3営業日以内に返信いたします
                </dd>
              </div>
            </div>
          </section>

          {/* 開示請求について */}
          <section className="bg-spiritual-lavender/10 border border-spiritual-lavender/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-spiritual-gold mb-3">
              開示請求について
            </h3>
            <p className="text-gray-300 leading-relaxed">
              個人情報保護の観点から、事業者名、代表者氏名、所在地、電話番号については非公開としております。
              これらの情報の開示をご希望される場合は、上記メールアドレスまでご請求ください。
              遅滞なく電子メールにて開示させていただきます。
            </p>
          </section>

          {/* 販売価格 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              販売価格
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-4">
              <p className="text-gray-300 mb-4">
                当サービスでは、ポイント制を採用しております。まとめ買いでお得になります。
              </p>
              <div className="space-y-3">
                <div className="border-b border-spiritual-lavender/20 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">お試しプラン</span>
                    <span className="text-spiritual-gold font-semibold">
                      480円（500ポイント）
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">鑑定結果1回分</p>
                </div>
                <div className="border-b border-spiritual-lavender/20 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">通常プラン</span>
                    <span className="text-spiritual-gold font-semibold">
                      1,350円（1,500ポイント）
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    鑑定結果3回分、10%お得
                  </p>
                </div>
                <div className="border-b border-spiritual-lavender/20 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">スタンダードプラン</span>
                    <span className="text-spiritual-gold font-semibold">
                      2,250円（2,500ポイント）
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    鑑定結果5回分、10%お得
                  </p>
                </div>
                <div className="border-b border-spiritual-lavender/20 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">プレミアムプラン</span>
                    <span className="text-spiritual-gold font-semibold">
                      4,250円（5,000ポイント）
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    鑑定結果10回分、15%お得
                  </p>
                </div>
                <div className="pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">VIPプラン</span>
                    <span className="text-spiritual-gold font-semibold">
                      12,000円（15,000ポイント）
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    鑑定結果31回分、20%お得
                  </p>
                </div>
              </div>
              <div className="bg-spiritual-lavender/10 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-300">
                  ※ 鑑定結果の閲覧には500ポイントが必要です
                </p>
                <p className="text-sm text-gray-300">
                  ※ 表示価格はすべて税込価格です
                </p>
                <p className="text-sm text-gray-300">
                  ※ キャンペーン等により価格が変動する場合があります
                </p>
              </div>
            </div>
          </section>

          {/* 商品代金以外の必要料金 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              商品代金以外の必要料金
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-accent mt-1">•</span>
                  <span>
                    インターネット接続料金（お客様のインターネット接続環境により異なります）
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-accent mt-1">•</span>
                  <span>
                    通信料金（お客様のご契約内容により異なります）
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-accent mt-1">•</span>
                  <span>送料・手数料：不要（デジタルコンテンツのため）</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 支払方法と支払時期 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              支払方法と支払時期
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-4">
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  対応決済方法
                </h3>
                <ul className="space-y-2 text-gray-300 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    クレジットカード（Visa、Mastercard、American Express、JCB、Diners Club、Discover）
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    Apple Pay
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    Google Pay
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    PayPay（準備中）
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  支払時期
                </h3>
                <p className="text-gray-300">
                  ポイント購入手続き完了時に即時決済されます。決済完了後、即座にポイントが付与されます。
                </p>
              </div>
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  決済代行会社
                </h3>
                <p className="text-gray-300">
                  Stripe, Inc.（クレジットカード情報は当社を経由せず、決済代行会社に直接送信されます）
                </p>
              </div>
            </div>
          </section>

          {/* サービスの提供時期 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              サービスの提供時期
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-3">
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  ポイントの付与
                </h3>
                <p className="text-gray-300">
                  決済完了後、即時にポイントが付与されます。
                </p>
              </div>
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  鑑定サービスの提供
                </h3>
                <p className="text-gray-300">
                  鑑定のご依頼後、通常1分～5分程度で鑑定結果が生成されます。
                  システムの負荷状況により、多少お時間をいただく場合がございます。
                </p>
              </div>
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  鑑定結果の閲覧
                </h3>
                <p className="text-gray-300">
                  鑑定結果はポイント消費後、即座に全文を閲覧いただけます。
                  過去の鑑定結果は履歴からいつでも無料で閲覧できます。
                </p>
              </div>
            </div>
          </section>

          {/* 返品・交換・キャンセルについて */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              返品・交換・キャンセルについて
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-2">
                  重要：デジタルコンテンツの特性による返品特約
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  当サービスで提供される商品は、デジタルコンテンツ（ポイント及び鑑定サービス）です。
                  特定商取引法第15条の3第2項に基づき、以下の通り返品特約を定めます。
                </p>
              </div>

              <div>
                <h3 className="text-spiritual-accent font-medium mb-3">
                  1. ポイント購入後のキャンセル・返金
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      デジタルコンテンツの性質上、決済完了後のキャンセル・返金は原則としてお受けできません
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      ポイントは購入完了時点で即座にアカウントに付与されるため、返品の対象外となります
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      誤って購入された場合も、デジタルコンテンツの性質上、返金対応はいたしかねます
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-spiritual-accent font-medium mb-3">
                  2. 鑑定結果閲覧後のキャンセル・返金
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      鑑定結果を閲覧（ポイント消費）した後のキャンセル・ポイント返還は原則としてお受けできません
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      占いという性質上、結果の内容に関する返金・ポイント返還の対応はいたしかねます
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-spiritual-accent font-medium mb-3">
                  3. 例外的に対応可能なケース
                </h3>
                <p className="text-gray-300 mb-2">
                  以下の場合に限り、返金またはポイント返還を検討いたします：
                </p>
                <div className="space-y-2 text-gray-300">
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      システムの不具合により、購入したポイントが正常に付与されなかった場合
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      システムの不具合により、鑑定サービスが正常に提供されなかった場合（鑑定結果が生成されない、文字化けなど）
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      当社の責めに帰すべき事由により、サービスが提供できなかった場合
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">▶</span>
                    <span>
                      二重決済など、明らかなシステムエラーによる誤請求があった場合
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-spiritual-lavender/10 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  返金・ポイント返還をご希望の場合は、お問い合わせメールアドレスまでご連絡ください。
                  状況を確認の上、個別に対応させていただきます。
                </p>
              </div>
            </div>
          </section>

          {/* サービス提供における責任範囲 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              サービス提供における責任範囲
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-4">
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  1. サービスの性質について
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>
                      当サービスは、AI技術を活用した占いコンテンツを提供するエンターテインメントサービスです
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>
                      鑑定結果は、お客様の人生における重要な決断の唯一の判断材料とすることは推奨いたしません
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>
                      鑑定結果の内容について、その正確性、確実性、有用性、適合性等を保証するものではありません
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  2. 免責事項
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>
                      鑑定結果に基づいて行われた行動の結果について、当社は一切の責任を負いません
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>
                      サービスの一時的な中断、遅延、変更、終了により生じた損害について、当社は責任を負いません
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>
                      ただし、当社の故意または重過失による場合は、この限りではありません
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  3. システム障害時の対応
                </h3>
                <p className="text-gray-300">
                  システム障害により鑑定サービスが正常に提供できなかった場合、
                  以下の対応を行います：
                </p>
                <ul className="space-y-2 text-gray-300 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>消費されたポイントの返還</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>再度の鑑定実施（無料）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spiritual-gold mt-1">•</span>
                    <span>その他、状況に応じた適切な補償</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ポイントの有効期限 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              ポイントの有効期限
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5">
              <p className="text-gray-300 mb-3">
                購入されたポイントの有効期限は、<span className="text-spiritual-gold font-semibold">購入日から1年間</span>です。
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-1">•</span>
                  <span>
                    有効期限を過ぎたポイントは自動的に失効します
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-1">•</span>
                  <span>
                    失効したポイントの返金、有効期限の延長はできません
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-1">•</span>
                  <span>
                    有効期限はマイページのポイント履歴から確認できます
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-1">•</span>
                  <span>
                    キャンペーン等で付与されたボーナスポイントも同様に1年間の有効期限が適用されます
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 動作環境 */}
          <section>
            <h2 className="text-xl font-bold text-spiritual-gold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spiritual-gold"></span>
              推奨動作環境
            </h2>
            <div className="bg-spiritual-dark/50 rounded-lg p-5 space-y-4">
              <p className="text-gray-300">
                当サービスを快適にご利用いただくための推奨環境は以下の通りです：
              </p>
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  対応ブラウザ
                </h3>
                <ul className="space-y-1 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    Google Chrome（最新版）
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    Safari（最新版）
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    Microsoft Edge（最新版）
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    Firefox（最新版）
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-spiritual-accent font-medium mb-2">
                  対応デバイス
                </h3>
                <ul className="space-y-1 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    パソコン（Windows、Mac）
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    スマートフォン（iOS、Android）
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-spiritual-gold"></span>
                    タブレット（iPad、Android）
                  </li>
                </ul>
              </div>
              <div className="bg-spiritual-lavender/10 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  ※ 上記以外の環境でも動作する場合がありますが、正常な動作を保証するものではありません
                </p>
                <p className="text-sm text-gray-300">
                  ※ JavaScriptを有効にしてご利用ください
                </p>
              </div>
            </div>
          </section>

          {/* お問い合わせ */}
          <section className="pt-4 border-t border-spiritual-lavender/20">
            <h2 className="text-lg font-bold text-spiritual-gold mb-3">
              お問い合わせ窓口
            </h2>
            <p className="text-gray-300 mb-3">
              特定商取引法に関するお問い合わせ、返金のご相談、その他ご不明点は、以下の窓口までご連絡ください。
            </p>
            <div className="bg-spiritual-dark/50 rounded-lg p-4 space-y-3">
              <p className="text-gray-300">
                <span className="font-semibold text-spiritual-accent">
                  サービス名：
                </span>
                スピチャ（SpiritualChat）
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-spiritual-accent">
                  お問い合わせ先：
                </span>
                <a
                  href="mailto:sanri3159211@gmail.com"
                  className="text-spiritual-gold hover:text-spiritual-accent transition-colors ml-1 underline"
                >
                  sanri3159211@gmail.com
                </a>
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-spiritual-accent">
                  対応時間：
                </span>
                メールでのお問い合わせは24時間受付
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-spiritual-accent">
                  返信目安：
                </span>
                原則として3営業日以内に返信いたします
              </p>
              <div className="bg-spiritual-lavender/10 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-300">
                  ※ お問い合わせには、本人確認のため、登録されているメールアドレスからのご連絡をお願いいたします
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  ※ 土日祝日のお問い合わせは、翌営業日以降の対応となります
                </p>
              </div>
            </div>
          </section>

          {/* 関連ページへのリンク */}
          <section className="pt-4 border-t border-spiritual-lavender/20">
            <h2 className="text-lg font-bold text-spiritual-gold mb-3">
              関連ページ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link
                href="/terms"
                className="bg-spiritual-dark/50 hover:bg-spiritual-dark/70 rounded-lg p-4 transition-colors border border-spiritual-lavender/20"
              >
                <h3 className="font-semibold text-spiritual-accent mb-1">
                  利用規約
                </h3>
                <p className="text-sm text-gray-400">
                  サービスのご利用にあたってのルール
                </p>
              </Link>
              <Link
                href="/privacy"
                className="bg-spiritual-dark/50 hover:bg-spiritual-dark/70 rounded-lg p-4 transition-colors border border-spiritual-lavender/20"
              >
                <h3 className="font-semibold text-spiritual-accent mb-1">
                  プライバシーポリシー
                </h3>
                <p className="text-sm text-gray-400">
                  個人情報の取り扱いについて
                </p>
              </Link>
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
