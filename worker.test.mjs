// 最小の自己チェック: `node worker.test.mjs` で実行。壊れれば throw する。
import assert from "node:assert";
import { addMessage } from "./worker.js";

// 空・空白は拒否
assert.equal(addMessage([], ""), null);
assert.equal(addMessage([], "   "), null);

// 11文字は拒否、10文字はOK
assert.equal(addMessage([], "12345678901"), null);
assert.equal(addMessage([], "1234567890").length, 1);

// 絵文字は1文字としてカウント（10個までOK、11個で拒否）
assert.equal(addMessage([], "😀".repeat(10)).length, 1);
assert.equal(addMessage([], "😀".repeat(11)), null);

// 新着が先頭、常に10件までに切り詰め（一番古いものが落ちる）
const full = Array.from({ length: 10 }, (_, i) => ({ text: `${i}`, at: 0 }));
const next = addMessage(full, "new");
assert.equal(next.length, 10);
assert.equal(next[0].text, "new");
assert.equal(next.at(-1).text, "8");

console.log("ok");
