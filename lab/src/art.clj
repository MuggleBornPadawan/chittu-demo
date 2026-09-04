(ns art)

(defn- int32 ^long [^long x]
  (unchecked-int x))

(defn- unsigned-shift-right ^long [^long x ^long n]
  (bit-shift-right (bit-and x 0xFFFFFFFF) n))

(defn- imul32 ^long [^long a ^long b]
  (int32 (* (int32 a) (int32 b))))

(defn mulberry32 [seed]
  (let [state (atom (int32 (bit-and seed 0xFFFFFFFF)))]
    (fn []
      (let [a-curr (swap! state (fn [a] (int32 (+ a 0x6D2B79F5))))
            t1 (imul32 (bit-xor a-curr (unsigned-shift-right a-curr 15))
                       (bit-or 1 a-curr))
            t2 (bit-xor (int32 (+ t1 (imul32 (bit-xor t1 (unsigned-shift-right t1 7))
                                            (bit-or 61 t1))))
                        t1)
            res-int (unsigned-shift-right (bit-xor t2 (unsigned-shift-right t2 14)) 0)]
        (/ (double res-int) 4294967296.0)))))

(defn generate-static-params [seed]
  (let [rng (mulberry32 seed)
        count-val (long (+ (Math/floor (* (double (rng)) 10.0)) 5))
        twist (* (double (rng)) Math/PI 2.0)
        scales (vec (repeatedly count-val #(+ 0.5 (* (double (rng)) 1.5))))
        palette-idx (long (Math/floor (* (double (rng)) 3.0)))
        light-angle (* (double (rng)) Math/PI 2.0)]
    {:count count-val
     :twist twist
     :scales scales
     :paletteIdx palette-idx
     :lightAngle light-angle}))
