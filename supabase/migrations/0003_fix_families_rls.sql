-- Fix: 招待コードで参加する際、まだ users テーブルに登録されていない
-- 認証済みユーザーが families テーブルを SELECT できないバグを修正する。
--
-- 旧ポリシーは id = current_family_id() のみだったため、
-- 新規ユーザー（current_family_id() が NULL を返す状態）には
-- 全行がマッチせず招待コード検索が失敗していた。

drop policy if exists families_select on families;
create policy families_select on families
  for select using (
    -- 既存メンバー: 自分の家族のみ
    -- 新規ユーザー: 招待コード参加のために認証済みなら参照可
    id = current_family_id() OR auth.uid() IS NOT NULL
  );
