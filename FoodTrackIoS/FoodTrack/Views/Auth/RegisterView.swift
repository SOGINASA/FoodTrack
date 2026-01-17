import SwiftUI

struct RegisterView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                        .padding(10)
                        .background(Color.black.opacity(0.04))
                        .cornerRadius(12)
                }
                Spacer()
            }
            .padding(.horizontal, 16)

            RegisterFlowView(
                onFinish: { draft in
                    authVM.finishRegistration(draft: draft)
                }
            )
            .padding(.horizontal, 16)

            Spacer(minLength: 10)
        }
        .padding(.top, 12)
        .background(Color.white)
        .navigationBarBackButtonHidden(true)
    }
}
