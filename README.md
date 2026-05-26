# English

# razweighted_neuron
Razweighted neuron is new powerful mathematic  neuron model that uses razweights and razweighted difference and it's own activation
# What is razweighted difference?
Razweighted difference is aggregation form/type that uses **dividing** and **substracting**, not **multiplying** and **adding**. Formula is `total=inp\[0\]/rw\[0\]-inp\[1\]/rw\[1\]-...-inp\[i\]/rw\[i\]`. 
# What this repository contains?
This repository contains implementation of:
-- Random Dobrofiner's Generator (32 and 128 bit) - RDG
-- Razweighted neuron models
-- Neuron model that uses only xorand
-- Fuzzy-logic(and maybe probalistic logic) compromise gate
-- Learning algorithm(rand-search -> mutations and if enabled multiplying by constant parameters and adding deltas)
-- Dubits (quantum-like deterministic bits/elements)
-- BINRT(Binary Image Recognition Test) samples generator and numbers in 6x5 or 5x6 to test neurons and if needed nets
-- activations(dobAct, hybrid with xorand and named as activation)
-- and other things that can be found in this repository.
# Activations
For this model, I have created activations:
- dobAct:
  - Powerful, non-monotonic, nonlinear activation. Formula is: d = |k - |k-0.5| + k - 1/k|;out=d / (d + 1)
- Ironically, named activation:
  - Monotonic, nonlinear activation. Formula is: d=(k*k/(k+1)+3k);out=d/(d+1)
- This activation used in neu:
  - It's non-monotonic, nonlinear and powerful. Firstly, used xor polinom is 1 - (1 - y + x\*x\*y) * (1 - x + x\*y\*y). And xorand is (a and b) xor c. And is a*\b in probalistic logic. So, xorand=(a,b,c)=>xor(a*b,c). Than, this activation is activation(xorand(total,rw\[0\],rw\[1\]))

# Русский
# Развещанный нейрон
Развещанный нейрон это новая, мощная математическая модель нейрона, которая использует развесы и развещанную разность, и собственную активацию.
# Что такое развещанная разность?
Развещанная разность это агрегация, которая использует **деление** и **вычитание**, а не **умножение** и **сложение**. Формула: `total=inp\[0\]/rw\[0\]-inp\[1\]/rw\[1\]-...-inp\[i\]/rw\[i\]`. 
# Что содержит этот репозиторий?
Этот репозиторий содержит реализации:
-- Random Dobrofiner's Generator (32 and 128 bit) - RDG
-- Модели развещенного нейрона
-- Модель, которая  использует только xorand
-- Гейт, нечеткой или вероятностной логики - гейт компромисса.
-- Алгоритм обучения(случайный поиск -> мутации,и если включено умножение на коэффициенты, и добавление дельт)
-- Дубиты (квантово-подобные элементы,детерминированы)
-- BINRT(Binary Image Recognition Test) генератор сэпмлов, и цифры 5x6 или 6x5, чтоб тестировать нейроны, и если надо сети
-- Активации (dobAct,гибрид с xorand и названной activation)
-- И другие вещи, которые тут можно найти
# Активации
Для этой модели, я создал следующие активации:
- dobAct:
  - Мощная, немонотонная, нелинейная активация. Формула: d = |k - |k-0.5| + k - 1/k|;out=d / (d + 1)
- Иронично, названная activation:
  - Монотонная, нелинейная активация. Формула: d=(k*k/(k+1)+3k);out=d/(d+1)
-Эта активация была использована в neu:
  - Она нелинейна, немонотонна и мощна. Для начала, использованный xor полином это 1 - (1 - y + x\*x\*y) * (1 - x + x\*y\*y). Xorand это (a and b) xor c. And это a*b в вероятностной логике. Так что xorand=(a,b,c)=>xor(a\*b,c). Таким образом, эта активация - activation(xorand(total,rw\[0\],rw\[1\]))
