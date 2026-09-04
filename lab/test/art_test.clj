(ns art-test
  (:require [clojure.test :refer [deftest is testing]]
            [clojure.data.json :as json]
            [clojure.java.io :as io]
            [art :refer [mulberry32 generate-static-params]]))

(deftest test-mulberry32-vectors
  (testing "Clojure mulberry32 matches frozen test vectors for seeds 1, 42, 99"
    (let [data (json/read-str (slurp (io/resource "vectors.json")) :key-fn identity)
          vectors (get data "rng")]
      (doseq [[seed-str expected-vals] vectors]
        (let [seed (Long/parseLong seed-str)
              rng (mulberry32 seed)
              generated (repeatedly (count expected-vals) rng)]
          (doseq [[gen exp] (map vector generated expected-vals)]
            (is (< (Math/abs (- (double gen) (double exp))) 1e-9))))))))

(deftest test-static-params-vectors
  (testing "Clojure generate-static-params matches frozen vectors for seeds 1, 42, 99"
    (let [data (json/read-str (slurp (io/resource "vectors.json")) :key-fn identity)
          vectors (get data "staticParams")]
      (doseq [[seed-str expected] vectors]
        (let [seed (Long/parseLong seed-str)
              params (generate-static-params seed)
              exp-count (long (get expected "count"))
              exp-twist (double (get expected "twist"))
              exp-scales (vec (map double (get expected "scales")))
              exp-palette (long (get expected "paletteIdx"))
              exp-light (double (get expected "lightAngle"))]
          (is (= (:count params) exp-count))
          (is (< (Math/abs (- (:twist params) exp-twist)) 1e-9))
          (is (= (:paletteIdx params) exp-palette))
          (is (< (Math/abs (- (:lightAngle params) exp-light)) 1e-9))
          (is (= (count (:scales params)) (count exp-scales)))
          (doseq [[gen exp] (map vector (:scales params) exp-scales)]
            (is (< (Math/abs (- (double gen) (double exp))) 1e-9))))))))
