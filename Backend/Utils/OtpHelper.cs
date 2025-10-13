// Backend/Utils/OtpHelper.cs
using System;
using System.Security.Cryptography;

namespace InvoicingBackend.Utils
{
    public static class OtpHelper
    {
        /// <summary>
        /// Generates a 6-digit OTP (One-Time Password)
        /// </summary>
        /// <returns>A 6-digit string OTP</returns>
        public static string GenerateOtp()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] bytes = new byte[4];
                rng.GetBytes(bytes);
                
                // Convert to positive integer and ensure 6 digits
                int value = Math.Abs(BitConverter.ToInt32(bytes, 0));
                return (value % 900000 + 100000).ToString(); // Ensures 6 digits (100000-999999)
            }
        }

        /// <summary>
        /// Validates if the provided OTP matches the stored OTP and is not expired
        /// </summary>
        /// <param name="providedOtp">OTP provided by user</param>
        /// <param name="storedOtp">OTP stored in database/cache</param>
        /// <param name="expiryTime">When the OTP expires</param>
        /// <returns>True if OTP is valid and not expired</returns>
        public static bool ValidateOtp(string providedOtp, string storedOtp, DateTime expiryTime)
        {
            if (string.IsNullOrWhiteSpace(providedOtp) || string.IsNullOrWhiteSpace(storedOtp))
                return false;

            if (DateTime.UtcNow > expiryTime)
                return false;

            return providedOtp.Equals(storedOtp, StringComparison.Ordinal);
        }

        /// <summary>
        /// Gets the OTP expiry time (5 minutes from now)
        /// </summary>
        /// <returns>DateTime when OTP should expire</returns>
        public static DateTime GetOtpExpiryTime()
        {
            return DateTime.UtcNow.AddMinutes(5);
        }
    }
}
