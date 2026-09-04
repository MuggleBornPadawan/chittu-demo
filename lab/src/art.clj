(ns art
  (:require [quil.core :as q]
            [quil.middleware :as m]))

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

;; --- Quil 3D REPL Visualization ---

(def palettes
  {0 [255 255 255]   ; 0 = white
   1 [0 0 0]         ; 1 = black
   2 [128 128 128]}) ; 2 = mid-grey

(defn setup-sketch [seed]
  (fn []
    (q/frame-rate 60)
    (q/background 176 176 176) ; #B0B0B0 wall
    (generate-static-params seed)))

(defn draw-sketch [state]
  (let [time (/ (q/millis) 1000.0)
        rot-y (* time 0.5)
        pulse (+ 1.0 (* 0.05 (Math/sin (* time 2.0))))
        [r g b] (get palettes (:paletteIdx state) [255 255 255])
        count-val (:count state)
        twist (:twist state)
        scales (:scales state)]

    (q/background 176 176 176)
    (q/lights)
    (q/directional-light 255 255 255 0.5 1 1)

    (q/push-matrix)
    (q/translate (/ (q/width) 2.0) (/ (q/height) 2.0) 0)
    (q/rotate-y rot-y)
    (q/scale pulse)
    (q/fill r g b)
    (q/stroke 50)

    (dotimes [i count-val]
      (let [sc (get scales i 1.0)
            angle (+ (* (/ (double i) count-val) Math/PI 2.0) twist)
            radius 120.0
            x (* (Math/cos angle) radius)
            y (* (- i (/ count-val 2.0)) 25.0)
            z (* (Math/sin angle) radius)]
        (q/push-matrix)
        (q/translate x y z)
        (q/box (* sc 40.0))
        (q/pop-matrix)))

    (q/pop-matrix)))

(defn run-lab-sketch
  "Launch interactive Quil 3D REPL sketch for a target seed."
  [seed]
  (q/defsketch art-lab
    :title (str "Virtual Museum Lab - Seed " seed)
    :size [800 600]
    :renderer :p3d
    :setup (setup-sketch seed)
    :draw draw-sketch
    :middleware [m/fun-mode]))

(defn -main [& args]
  (let [seed (if (seq args) (Long/parseLong (first args)) 42)]
    (println "Starting Quil 3D REPL sketch for seed:" seed)
    (run-lab-sketch seed)))
