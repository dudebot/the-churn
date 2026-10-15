# The Churn: model specification

Version 1.0.0. This is an uncalibrated mechanism experiment, not an empirical model of collapse, real geopolitical data, or a validated relationship between hardship and group size.

## Scientific basis

The implemented influence step adapts **Deffuant et al. (2000), Mixing beliefs among interacting agents**, [DOI](https://doi.org/10.1142/S0219525900000078), with an [expanded author manuscript](https://arxiv.org/abs/cond-mat/0111494). Compatible agents compromise; narrow confidence bounds can sustain several opinion clusters. We use five continuous dimensions and an explicit social graph, rather than claiming to reproduce every condition of that paper.

The network adaptation is motivated by **Holme & Newman (2006), Nonequilibrium phase transition in the coevolution of networks and opinions**, [DOI](https://doi.org/10.1103/PhysRevE.74.056108), [author manuscript](https://arxiv.org/abs/physics/0603023). Their discrete opinions, copying rule and rewiring mechanism differ from ours. We additionally permit tie deletion when replacement is impossible. Their published critical behavior is not a numerical prediction for this implementation.

**Krosch & Amodio (2014), Economic scarcity alters the perception of race**, [PubMed](https://pubmed.ncbi.nlm.nih.gov/24927595/), provides empirical support for a *possible* boundary mechanism in specific racial categorization and allocation tasks. It does not demonstrate smaller ideological groups under collapse, fit our coefficients, or establish that all kinds of threat produce exclusion.

**Drury, Cocking & Reicher (2009), Everyone for themselves? A comparative study of crowd solidarity among emergency survivors**, [DOI](https://doi.org/10.1348/014466608X357893), reports emergent shared identity and solidarity in interviews with 21 survivors across 11 emergencies. This motivates a countermechanism; it does not fit the effect size of our mutual-aid control. Related [experimental work](https://pubmed.ncbi.nlm.nih.gov/19587213/) also examines shared threat and cooperation.

## Initialization

- N = 360 synthetic agents, each with an initial vector and current vector in [0,1]^5.
- Twenty-four synthetic seed profiles have coordinates sampled uniformly in [.09,.91]. Unequal positive profile weights produce different local population densities. Agents are sampled from these profiles with independent Gaussian standard deviation .065, clipped to [0,1]. These initial modes are a declared generative assumption, not inferred social groups.
- Each agent makes five random undirected connection attempts. Self loops and duplicate ties are excluded. Realized average initial degree is approximately ten.
- A seeded PRNG controls initialization and encounters. Each condition starts again from the same initial population and graph. The encounter seed is deterministically derived from the population seed. Random paths subsequently diverge as topology changes, so paired seeds do not mean identical event sequences.
- Ninety sweeps of N encounter attempts are run per condition. This is a finite horizon, not a convergence claim or a calendar time unit.

## Scenario parameters

Let c = churn / 100 and b = shared fate / 100:

```
confidence epsilon = 0.40 - 0.345 c + 0.24 b
rejection rewiring probability r = (0.025 + 0.82 c)(1 - 0.85 b)
independent bridge-encounter probability q = 0.07 b
compromise mu = 0.20
bridge confidence radius = min(0.80, epsilon + 0.25 b)
```

These coefficients are **illustrative scenario assumptions**, not empirical estimates. Churn intentionally combines reduced confidence with increased loss/replacement of incompatible ties; this does not identify separate causal effects of scarcity, institutional weakness, or fear. The independent shared-fate control changes three declared mechanisms: tolerance, tie retention, and bridge encounters. It must not be interpreted as a calibrated policy dose or a measured intervention benefit.

The context selects which coordinates enter similarity and compromise: all five; first two (illustratively called material needs); or final three (illustratively called values & identity). These names are conceptual labels, not validated survey scales. Each context is a separate counterfactual run. There are no simultaneously fitted membership probabilities.

## Encounter and graph updates

1. Sample an agent i uniformly. With probability q, sample a global agent j; otherwise sample one of i's current graph neighbors. An isolated agent with no global encounter does nothing.
2. Compute root-mean-square coordinate distance over the selected dimensions: `d(i,j) = sqrt(sum((xi[k]-xj[k])²)/D)`.
3. If d is below the applicable confidence radius, update the selected coordinates **simultaneously from their old values**:

   `xi' = xi + mu (xj - xi)` and `xj' = xj + mu (xi - xj)`.

   An accepted global encounter also adds an undirected tie if absent. No noise or repulsive movement is applied.
4. Otherwise, for a non-global encounter, with probability r remove the encountered tie. Search for agents outside i's current neighbors and inside i's confidence bound, and add one uniformly sampled compatible replacement if possible. If none exists, the tie stays deleted. This deletion rule is an extension of the cited adaptive-network mechanism.

No group counts, memberships, or desired plot outcomes enter these update rules. Pair compromise conserves the population mean in every selected coordinate and stays inside [0,1]. A true exact consensus cannot split under these averaging dynamics; that is why slider conditions restart from initial heterogeneity.

## Metrics

After the last encounter, compute connected components of the **remaining graph**. No churn-dependent clustering cutoff is applied to define groups.

- Group count includes all connected components, including singletons.
- Largest share is `max(n_g)/N`.
- Typical group size is `sum(n_g²)/N`: the size of the group containing a uniformly chosen agent, rather than the median component. This avoids treating a singleton and a large component as equally representative of the population.
- Isolated agents have degree zero.
- Effective group count, included in exported data, is `N²/sum(n_g²)`.
- Edge count, influence acceptance, and event counts are also exported. Influence acceptance is not called social trust or boundary permeability.

Some incompatible ties can remain at the finite horizon. A connected component need not be internally unanimous, a clique, emotionally close, or hostile to other components. There is no violence variable. In particular, the model's group definition does **not** establish a group willing to kill outsiders.

## Projection and field rendering

PCA is actually computed from the five-dimensional **initial synthetic vectors**. A fixed center and two orthonormal leading eigenvectors locate each starting profile. The retained initial variance is computed and displayed. Projection is never recomputed when changing churn, shared fate or context for a given seed.

Agent positions **remain at their starting profiles**, even when opinions change. This is a reference layout showing how the same population reorganizes its connections, not a plot of current ideological positions. Exported `opinion` values contain current coordinates. Two visually nearby agents can differ in three hidden dimensions and belong to different components.

Each component gets a color based on its minimum agent ID. Each agent contributes a Gaussian kernel with sigma = .039 times the fixed square reference-map width. Contributions of a component add to its density field; component colors blend by local density. Total density controls opacity with `205 * (1 - exp(-0.26*density))`. Contours are drawn at fixed component densities .85 and 3.4.

Bandwidth, opacity transfer, contour levels, saturation and agent positions do not depend on churn. Changes in component membership redistribute color and component density, producing different colored footprints and boundaries. Disconnected lobes of one color can belong to one graph component. Overlapping color is a projection/density mixture, not a claim of quantified overlapping identity or a physical border. Thin edges are a subsample for readability; selected agents expose all direct ties.

## Verification and sensitivity

Run `npm test` for deterministic reproduction, numerical conservation, valid graph edges, agent bounds, zero-confidence behavior, no-rewiring topology, context effects, countermechanism effects and PCA orthogonality.

Run `npm run audit` to regenerate `audit.json`: 20 paired synthetic populations × six conditions × 90 sweeps. This is a sensitivity check, **not empirical validation**. With version 1.0.0, the resulting summary is:

| Condition | Median groups (range) | Median largest share | Median typical size |
|---|---:|---:|---:|
| Churn 0, shared fate 20 | 1 (1–1) | 100% | 360.0 |
| Churn 50, shared fate 20 | 1 (1–3) | 100% | 360.0 |
| Churn 75, shared fate 20 | 4 (1–9) | 81.1% | 245.5 |
| Churn 100, shared fate 20 | 19 (15–24) | 15.8% | 35.5 |
| Churn 100, shared fate 0 | 128.5 (103–146) | 9.3% | 12.4 |
| Churn 100, shared fate 100 | 1 (1–1) | 100% | 360.0 |

The fractional median count is the average of the two central integer results. A fragmented result at every intermediate slider step is not guaranteed. Changing initial modes, graph degree, horizon or coefficient mappings can move or remove transitions. The 20 seeds probe initialization variation at fixed model assumptions, not all structural uncertainty.

The browser has no autonomous movement or infinite updating. It computes a static condition on deliberate input; it therefore does not need a play/pause control. Native range controls support arrows and Home/End. A labeled HTML agent selector duplicates pointer inspection; numerical outputs duplicate the essential canvas information. Reduced motion disables smooth scrolling. Color is supplemented with agent IDs, direct ties, circle IDs and numerical group results.

## Reproduction

The data download includes version, seed, inputs, parameters, agents, graph edges, components, events, metrics and PCA basis. Call `simulate({seed,churn,solidarity,context,n,sweeps})` in `model.js` with the exported input values to reproduce the scenario. Simulation and rendering are separate modules; rendering cannot modify the network metrics.
