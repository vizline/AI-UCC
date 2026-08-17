* AI-UCC pilot: starter preparation syntax.
* Import the CSV through File > Import Data > CSV first, then run this file.
* Raw variables are preserved; reversed variables receive the suffix _REV.

RECODE A05_R A06_R B05_R C04_R C05_R D04_R E04_R F04_R
 G04_R G05_R G06_R H03_R H04_R H05_R I04_R I05_R
 (1=7) (2=6) (3=5) (4=4) (5=3) (6=2) (7=1)
 INTO A05_REV A06_REV B05_REV C04_REV C05_REV D04_REV E04_REV F04_REV
 G04_REV G05_REV G06_REV H03_REV H04_REV H05_REV I04_REV I05_REV.

VARIABLE LEVEL age contribution (SCALE).
VARIABLE LEVEL scenario means perspective gender education employment ai_frequency study_guess (NOMINAL).

VALUE LABELS completed 1 'Complete'.
EXECUTE.

* Illustrative pilot composites only. Confirm the CFA structure before final scoring.
COMPUTE competence_mean = MEAN.4(A01,A02,A03,A04,A05_REV).
COMPUTE diligence_mean = MEAN.4(B01,B02,B03,B04,B05_REV).
COMPUTE warmth_mean = MEAN.4(C01,C02,C03,C04_REV,C05_REV).
COMPUTE credibility_mean = MEAN.3(D01,D02,D03,D04_REV).
COMPUTE quality_mean = MEAN.3(E01,E02,E03,E04_REV).
COMPUTE authenticity_mean = MEAN.3(F01,F02,F03,F04_REV).
COMPUTE effort_mean = MEAN.4(G01,G02,G03,G04_REV,G05_REV,G06_REV).
COMPUTE morality_mean = MEAN.3(H01,H02,H03_REV,H04_REV,H05_REV).
COMPUTE ownership_mean = MEAN.3(I01,I02,I03,I04_REV,I05_REV).
COMPUTE augmentation_mean = MEAN.3(J01,J02,J03,J04).
COMPUTE outsourcing_mean = MEAN.3(K01,K02,K03,K04).
EXECUTE.
