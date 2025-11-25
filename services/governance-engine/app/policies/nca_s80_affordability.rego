# Placeholder for Regulations-as-Code policies.
#
# Example: A policy to check if a loan's DTI is compliant.
#
package tficre.rules.nca

default allow = false

allow {
    input.dti <= 45
}
